import React, { ChangeEvent, FC, useState, useEffect, useRef } from "react";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

// react-hook-form
import { Controller, useForm } from "react-hook-form";
// services
import aiService from "services/ai.service";
// hooks
import useToast from "hooks/use-toast";
// components
import { GptAssistantModal } from "components/core";
import {
  IssueAssigneeSelect,
  IssueDateSelect,
  IssueEstimateSelect,
  IssueLabelSelect,
  IssueParentSelect,
  IssuePrioritySelect,
  IssueProjectSelect,
  IssueStateSelect,
} from "components/issues/select";
import { CreateStateModal } from "components/states";
import { CreateLabelModal } from "components/labels";
// ui
import {
  CustomMenu,
  Input,
  Loader,
  PrimaryButton,
  SecondaryButton,
  ToggleSwitch,
} from "components/ui";
// icons
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
// helpers
import { cosineSimilarity } from "helpers/string.helper";
// types
import type { ICurrentUserResponse, IIssue } from "types";
// rich-text-editor
const RemirrorRichTextEditor = dynamic(() => import("components/rich-text-editor"), {
  ssr: false,
  loading: () => (
    <Loader className="mt-4">
      <Loader.Item height="12rem" width="100%" />
    </Loader>
  ),
});

import { IRemirrorRichTextEditor } from "components/rich-text-editor";

const WrappedRemirrorRichTextEditor = React.forwardRef<
  IRemirrorRichTextEditor,
  IRemirrorRichTextEditor
>((props, ref) => <RemirrorRichTextEditor {...props} forwardedRef={ref} />);

WrappedRemirrorRichTextEditor.displayName = "WrappedRemirrorRichTextEditor";

const defaultValues: Partial<IIssue> = {
  project: "",
  name: "",
  description: {
    type: "doc",
    content: [
      {
        type: "paragraph",
      },
    ],
  },
  description_html: "<p></p>",
  estimate_point: null,
  state: "",
  priority: null,
  assignees: [],
  assignees_list: [],
  labels: [],
  labels_list: [],
};

export interface IssueFormProps {
  handleFormSubmit: (values: Partial<IIssue>) => Promise<void>;
  initialData?: Partial<IIssue>;
  issues: IIssue[];
  projectId: string;
  setActiveProject: React.Dispatch<React.SetStateAction<string | null>>;
  createMore: boolean;
  setCreateMore: React.Dispatch<React.SetStateAction<boolean>>;
  handleClose: () => void;
  status: boolean;
  user: ICurrentUserResponse | undefined;
  fieldsToShow: (
    | "project"
    | "name"
    | "description"
    | "state"
    | "priority"
    | "assignee"
    | "label"
    | "dueDate"
    | "estimate"
    | "parent"
    | "all"
  )[];
}

export const IssueForm: FC<IssueFormProps> = ({
  handleFormSubmit,
  initialData,
  issues = [],
  projectId,
  setActiveProject,
  createMore,
  setCreateMore,
  handleClose,
  status,
  user,
  fieldsToShow,
}) => {
  // states
  const [mostSimilarIssue, setMostSimilarIssue] = useState<IIssue | undefined>();
  const [stateModal, setStateModal] = useState(false);
  const [labelModal, setLabelModal] = useState(false);
  const [parentIssueListModalOpen, setParentIssueListModalOpen] = useState(false);

  const [gptAssistantModal, setGptAssistantModal] = useState(false);
  const [iAmFeelingLucky, setIAmFeelingLucky] = useState(false);

  const editorRef = useRef<any>(null);

  const router = useRouter();
  const { workspaceSlug } = router.query;

  const { setToastAlert } = useToast();

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    watch,
    control,
    getValues,
    setValue,
    setFocus,
  } = useForm<IIssue>({
    defaultValues: initialData ?? defaultValues,
    reValidateMode: "onChange",
  });

  const issueName = watch("name");

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const similarIssue = issues?.find((i: IIssue) => cosineSimilarity(i.name, value) > 0.7);
    setMostSimilarIssue(similarIssue);
  };

  const handleCreateUpdateIssue = async (formData: Partial<IIssue>) => {
    await handleFormSubmit(formData);

    setGptAssistantModal(false);

    reset({
      ...defaultValues,
      project: projectId,
      description: {
        type: "doc",
        content: [
          {
            type: "paragraph",
          },
        ],
      },
      description_html: "<p></p>",
    });
    editorRef?.current?.clearEditor();
  };

  const handleAiAssistance = async (response: string) => {
    if (!workspaceSlug || !projectId) return;

    setValue("description", {});
    setValue("description_html", `${watch("description_html")}<p>${response}</p>`);
    editorRef.current?.setEditorValue(`${watch("description_html")}`);
  };

  const handleAutoGenerateDescription = async () => {
    if (!workspaceSlug || !projectId) return;

    setIAmFeelingLucky(true);

    aiService
      .createGptTask(
        workspaceSlug as string,
        projectId as string,
        {
          prompt: issueName,
          task: "Generate a proper description for this issue.",
        },
        user
      )
      .then((res) => {
        if (res.response === "")
          setToastAlert({
            type: "error",
            title: "Error!",
            message:
              "Issue title isn't informative enough to generate the description. Please try with a different title.",
          });
        else handleAiAssistance(res.response_html);
      })
      .catch((err) => {
        if (err.status === 429)
          setToastAlert({
            type: "error",
            title: "Error!",
            message:
              "You have reached the maximum number of requests of 50 requests per month per user.",
          });
        else
          setToastAlert({
            type: "error",
            title: "Error!",
            message: "Some error occurred. Please try again.",
          });
      })
      .finally(() => setIAmFeelingLucky(false));
  };

  useEffect(() => {
    setFocus("name");

    reset({
      ...defaultValues,
      ...initialData,
      project: projectId,
    });
  }, [setFocus, initialData, reset, projectId]);

  return (
    <>
      {projectId && (
        <>
          <CreateStateModal
            isOpen={stateModal}
            handleClose={() => setStateModal(false)}
            projectId={projectId}
            user={user}
          />
          <CreateLabelModal
            isOpen={labelModal}
            handleClose={() => setLabelModal(false)}
            projectId={projectId}
            user={user}
          />
        </>
      )}
      <form onSubmit={handleSubmit(handleCreateUpdateIssue)}>
        <div className="space-y-5">
          <div className="flex items-center gap-x-2">
            {(fieldsToShow.includes("all") || fieldsToShow.includes("project")) && (
              <Controller
                control={control}
                name="project"
                render={({ field: { value, onChange } }) => (
                  <IssueProjectSelect
                    value={value}
                    onChange={onChange}
                    setActiveProject={setActiveProject}
                  />
                )}
              />
            )}
            <h3 className="text-xl font-semibold leading-6 text-brand-base">
              {status ? "Update" : "Create"} Issue
            </h3>
          </div>
          {watch("parent") &&
            watch("parent") !== "" &&
            (fieldsToShow.includes("all") || fieldsToShow.includes("parent")) && (
              <div className="flex w-min items-center gap-2 whitespace-nowrap rounded bg-brand-surface-2 p-2 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="block h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: issues.find((i) => i.id === watch("parent"))?.state_detail
                        .color,
                    }}
                  />
                  <span className="flex-shrink-0 text-brand-secondary">
                    {/* {projects?.find((p) => p.id === projectId)?.identifier}- */}
                    {issues.find((i) => i.id === watch("parent"))?.sequence_id}
                  </span>
                  <span className="truncate font-medium">
                    {issues.find((i) => i.id === watch("parent"))?.name.substring(0, 50)}
                  </span>
                  <XMarkIcon
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setValue("parent", null)}
                  />
                </div>
              </div>
            )}
          <div className="space-y-3">
            <div className="mt-2 space-y-3">
              {(fieldsToShow.includes("all") || fieldsToShow.includes("name")) && (
                <div>
                  <Input
                    id="name"
                    name="name"
                    onChange={handleTitleChange}
                    className="resize-none text-xl"
                    placeholder="Title"
                    autoComplete="off"
                    error={errors.name}
                    register={register}
                    validations={{
                      required: "Title is required",
                      maxLength: {
                        value: 255,
                        message: "Title should be less than 255 characters",
                      },
                    }}
                  />
                  {mostSimilarIssue && (
                    <div className="flex items-center gap-x-2">
                      <p className="text-sm text-brand-secondary">
                        <Link
                          href={`/${workspaceSlug}/projects/${projectId}/issues/${mostSimilarIssue.id}`}
                        >
                          <a target="_blank" type="button" className="inline text-left">
                            <span>Did you mean </span>
                            <span className="italic">
                              {mostSimilarIssue.project_detail.identifier}-
                              {mostSimilarIssue.sequence_id}: {mostSimilarIssue.name}{" "}
                            </span>
                            ?
                          </a>
                        </Link>
                      </p>
                      <button
                        type="button"
                        className="text-sm text-brand-accent"
                        onClick={() => {
                          setMostSimilarIssue(undefined);
                        }}
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              )}
              {(fieldsToShow.includes("all") || fieldsToShow.includes("description")) && (
                <div className="relative">
                  <div className="-mb-2 flex justify-end">
                    {issueName && issueName !== "" && (
                      <button
                        type="button"
                        className={`flex items-center gap-1 rounded px-1.5 py-1 text-xs hover:bg-brand-surface-1 ${
                          iAmFeelingLucky ? "cursor-wait" : ""
                        }`}
                        onClick={handleAutoGenerateDescription}
                        disabled={iAmFeelingLucky}
                      >
                        {iAmFeelingLucky ? (
                          "Generating response..."
                        ) : (
                          <>
                            <SparklesIcon className="h-4 w-4" />I{"'"}m feeling lucky
                          </>
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      className="flex items-center gap-1 rounded px-1.5 py-1 text-xs hover:bg-brand-surface-1"
                      onClick={() => setGptAssistantModal((prevData) => !prevData)}
                    >
                      <SparklesIcon className="h-4 w-4" />
                      AI
                    </button>
                  </div>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field: { value } }) => (
                      <WrappedRemirrorRichTextEditor
                        value={
                          !value || (typeof value === "object" && Object.keys(value).length === 0)
                            ? watch("description_html")
                            : value
                        }
                        onJSONChange={(jsonValue) => setValue("description", jsonValue)}
                        onHTMLChange={(htmlValue) => setValue("description_html", htmlValue)}
                        placeholder="Description"
                        ref={editorRef}
                      />
                    )}
                  />
                  <GptAssistantModal
                    isOpen={gptAssistantModal}
                    handleClose={() => {
                      setGptAssistantModal(false);
                      // this is done so that the title do not reset after gpt popover closed
                      reset(getValues());
                    }}
                    inset="top-2 left-0"
                    content=""
                    htmlContent={watch("description_html")}
                    onResponse={(response) => {
                      handleAiAssistance(response);
                    }}
                    projectId={projectId}
                  />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {(fieldsToShow.includes("all") || fieldsToShow.includes("state")) && (
                  <Controller
                    control={control}
                    name="state"
                    render={({ field: { value, onChange } }) => (
                      <IssueStateSelect
                        setIsOpen={setStateModal}
                        value={value}
                        onChange={onChange}
                        projectId={projectId}
                      />
                    )}
                  />
                )}
                {(fieldsToShow.includes("all") || fieldsToShow.includes("priority")) && (
                  <Controller
                    control={control}
                    name="priority"
                    render={({ field: { value, onChange } }) => (
                      <IssuePrioritySelect value={value} onChange={onChange} />
                    )}
                  />
                )}
                {(fieldsToShow.includes("all") || fieldsToShow.includes("assignee")) && (
                  <Controller
                    control={control}
                    name="assignees"
                    render={({ field: { value, onChange } }) => (
                      <IssueAssigneeSelect
                        projectId={projectId}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                )}
                {(fieldsToShow.includes("all") || fieldsToShow.includes("label")) && (
                  <Controller
                    control={control}
                    name="labels"
                    render={({ field: { value, onChange } }) => (
                      <IssueLabelSelect
                        setIsOpen={setLabelModal}
                        value={value}
                        onChange={onChange}
                        projectId={projectId}
                      />
                    )}
                  />
                )}
                {(fieldsToShow.includes("all") || fieldsToShow.includes("dueDate")) && (
                  <div>
                    <Controller
                      control={control}
                      name="target_date"
                      render={({ field: { value, onChange } }) => (
                        <IssueDateSelect value={value} onChange={onChange} />
                      )}
                    />
                  </div>
                )}
                {(fieldsToShow.includes("all") || fieldsToShow.includes("estimate")) && (
                  <div>
                    <Controller
                      control={control}
                      name="estimate_point"
                      render={({ field: { value, onChange } }) => (
                        <IssueEstimateSelect value={value} onChange={onChange} />
                      )}
                    />
                  </div>
                )}
                {(fieldsToShow.includes("all") || fieldsToShow.includes("parent")) && (
                  <IssueParentSelect
                    control={control}
                    isOpen={parentIssueListModalOpen}
                    setIsOpen={setParentIssueListModalOpen}
                    issues={issues ?? []}
                  />
                )}
                {(fieldsToShow.includes("all") || fieldsToShow.includes("parent")) && (
                  <CustomMenu ellipsis>
                    {watch("parent") && watch("parent") !== "" ? (
                      <>
                        <CustomMenu.MenuItem
                          renderAs="button"
                          onClick={() => setParentIssueListModalOpen(true)}
                        >
                          Change parent issue
                        </CustomMenu.MenuItem>
                        <CustomMenu.MenuItem
                          renderAs="button"
                          onClick={() => setValue("parent", null)}
                        >
                          Remove parent issue
                        </CustomMenu.MenuItem>
                      </>
                    ) : (
                      <CustomMenu.MenuItem
                        renderAs="button"
                        onClick={() => setParentIssueListModalOpen(true)}
                      >
                        Select Parent Issue
                      </CustomMenu.MenuItem>
                    )}
                  </CustomMenu>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="-mx-5 mt-5 flex items-center justify-between gap-2 border-t border-brand-base px-5 pt-5">
          <div
            className="flex cursor-pointer items-center gap-1"
            onClick={() => setCreateMore((prevData) => !prevData)}
          >
            <span className="text-xs">Create more</span>
            <ToggleSwitch value={createMore} onChange={() => {}} size="md" />
          </div>
          <div className="flex items-center gap-2">
            <SecondaryButton onClick={handleClose}>Discard</SecondaryButton>
            <PrimaryButton type="submit" loading={isSubmitting}>
              {status
                ? isSubmitting
                  ? "Updating Issue..."
                  : "Update Issue"
                : isSubmitting
                ? "Adding Issue..."
                : "Add Issue"}
            </PrimaryButton>
          </div>
        </div>
      </form>
    </>
  );
};
