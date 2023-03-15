import React from "react";

import { useRouter } from "next/router";

import { mutate } from "swr";

// react-hook-form
import { useForm } from "react-hook-form";
// headless ui
import { Dialog, Transition } from "@headlessui/react";
// services
import viewsService from "services/views.service";
// hooks
import useToast from "hooks/use-toast";
// components
import { ViewForm } from "components/views";
// types
import { IView } from "types";
// fetch-keys
import { VIEWS_LIST } from "constants/fetch-keys";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  data?: IView;
};

const defaultValues: Partial<IView> = {
  name: "",
  description: "",
};

export const CreateUpdateViewModal: React.FC<Props> = ({ isOpen, handleClose, data }) => {
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;

  const { setToastAlert } = useToast();

  const onClose = () => {
    handleClose();
    reset(defaultValues);
  };

  const { reset } = useForm<IView>({
    defaultValues,
  });

  const createView = async (payload: IView) => {
    await viewsService
      .createView(workspaceSlug as string, projectId as string, payload)
      .then(() => {
        mutate(VIEWS_LIST(projectId as string));
        handleClose();

        setToastAlert({
          type: "success",
          title: "Success!",
          message: "View created successfully.",
        });
      })
      .catch(() => {
        setToastAlert({
          type: "error",
          title: "Error!",
          message: "View could not be created. Please try again.",
        });
      });
  };

  const updateView = async (payload: IView) => {
    await viewsService
      .updateView(workspaceSlug as string, projectId as string, data?.id ?? "", payload)
      .then((res) => {
        mutate<IView[]>(
          VIEWS_LIST(projectId as string),
          (prevData) =>
            prevData?.map((p) => {
              if (p.id === res.id) return { ...p, ...payload };

              return p;
            }),
          false
        );
        onClose();

        setToastAlert({
          type: "success",
          title: "Success!",
          message: "View updated successfully.",
        });
      })
      .catch(() => {
        setToastAlert({
          type: "error",
          title: "Error!",
          message: "View could not be updated. Please try again.",
        });
      });
  };

  const handleFormSubmit = async (formData: IView) => {
    if (!workspaceSlug || !projectId) return;

    if (!data) await createView(formData);
    else await updateView(formData);
  };

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-20" onClose={handleClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform rounded-lg bg-white px-5 py-8 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <ViewForm
                  handleFormSubmit={handleFormSubmit}
                  handleClose={handleClose}
                  status={data ? true : false}
                  data={data}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
