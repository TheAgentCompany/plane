// react
import React, { useMemo } from "react";
// next
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

// swr
import { KeyedMutator } from "swr";
// react-hook-form
import { useForm, Controller } from "react-hook-form";
// services
import issuesServices from "lib/services/issues.service";
// types
import type { IIssueActivity, IIssueComment } from "types";
// common
import { debounce } from "constants/common";

const RemirrorRichTextEditor = dynamic(() => import("components/rich-text-editor"), { ssr: false });

const defaultValues: Partial<IIssueComment> = {
  comment_html: "",
  comment_json: "",
};
const IssueCommentSection: React.FC<{
  mutate: KeyedMutator<IIssueActivity[]>;
}> = ({ mutate }) => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
    reset,
  } = useForm<IIssueComment>({ defaultValues });

  const router = useRouter();

  let { workspaceSlug, projectId, issueId } = router.query;

  const onSubmit = async (formData: IIssueComment) => {
    if (
      !workspaceSlug ||
      !projectId ||
      !issueId ||
      isSubmitting ||
      !formData.comment_html ||
      !formData.comment_json
    )
      return;
    await issuesServices
      .createIssueComment(workspaceSlug as string, projectId as string, issueId as string, formData)
      .then((response) => {
        console.log(response);
        mutate();
        reset(defaultValues);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const updateDescription = useMemo(
    () =>
      debounce((key: any, val: any) => {
        setValue(key, val);
      }, 1000),
    [setValue]
  );

  const updateDescriptionHTML = useMemo(
    () =>
      debounce((key: any, val: any) => {
        setValue(key, val);
      }, 1000),
    [setValue]
  );

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-md p-2 pt-3">
          <Controller
            name="comment_html"
            control={control}
            render={({ field: { value, onChange } }) => (
              <RemirrorRichTextEditor
                value={value}
                onBlur={(jsonValue, htmlValue) => {
                  setValue("comment_json", jsonValue);
                  setValue("comment_html", htmlValue);
                }}
                placeholder="Enter Your comment..."
              />
            )}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-gray-300 p-2 px-4 text-sm text-black hover:bg-gray-300"
          >
            {isSubmitting ? "Adding..." : "Comment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssueCommentSection;
