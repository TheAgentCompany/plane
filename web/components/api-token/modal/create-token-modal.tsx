import React, { useState } from "react";
import { useRouter } from "next/router";
import { mutate } from "swr";
// types
import { IApiToken } from "@plane/types";
// ui
import { TOAST_TYPE, setToast } from "@plane/ui";
// components
import { CreateApiTokenForm, GeneratedTokenDetails } from "@/components/api-token";
import { EModalPosition, EModalWidth, ModalCore } from "@/components/core";
// constants
import { API_TOKEN_CREATED } from "@/constants/event-tracker";
import { API_TOKENS_LIST } from "@/constants/fetch-keys";
// helpers
import { renderFormattedDate } from "@/helpers/date-time.helper";
import { csvDownload } from "@/helpers/download.helper";
// hooks
import { useEventTracker } from "@/hooks/store";
// services
import { APITokenService } from "@/services/api_token.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

// services
const apiTokenService = new APITokenService();

export const CreateApiTokenModal: React.FC<Props> = (props) => {
  const { isOpen, onClose } = props;
  // states
  const [neverExpires, setNeverExpires] = useState<boolean>(false);
  const [generatedToken, setGeneratedToken] = useState<IApiToken | null | undefined>(null);
  // router
  const router = useRouter();
  const { workspaceSlug } = router.query;
  // store hooks
  const { captureEvent } = useEventTracker();

  const handleClose = () => {
    onClose();

    setTimeout(() => {
      setNeverExpires(false);
      setGeneratedToken(null);
    }, 350);
  };

  const downloadSecretKey = (data: IApiToken) => {
    const csvData = {
      Title: data.label,
      Description: data.description,
      Expiry: data.expired_at ? renderFormattedDate(data.expired_at)?.replace(",", " ") ?? "" : "Never expires",
      "Secret key": data.token ?? "",
    };

    csvDownload(csvData, `secret-key-${Date.now()}`);
  };

  const handleCreateToken = async (data: Partial<IApiToken>) => {
    if (!workspaceSlug) return;

    // make the request to generate the token
    await apiTokenService
      .createApiToken(workspaceSlug.toString(), data)
      .then((res) => {
        setGeneratedToken(res);
        downloadSecretKey(res);

        mutate<IApiToken[]>(
          API_TOKENS_LIST(workspaceSlug.toString()),
          (prevData) => {
            if (!prevData) return;

            return [res, ...prevData];
          },
          false
        );
        captureEvent(API_TOKEN_CREATED, {
          token_id: res.id,
          expiry_date: data.expired_at ?? undefined,
          never_exprires: res.expired_at ? false : true,
        });
      })
      .catch((err) => {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: err.message,
        });

        throw err;
      });
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={() => {}} position={EModalPosition.TOP} width={EModalWidth.XXL}>
      {generatedToken ? (
        <GeneratedTokenDetails handleClose={handleClose} tokenDetails={generatedToken} />
      ) : (
        <CreateApiTokenForm
          handleClose={handleClose}
          neverExpires={neverExpires}
          toggleNeverExpires={() => setNeverExpires((prevData) => !prevData)}
          onSubmit={handleCreateToken}
        />
      )}
    </ModalCore>
  );
};
