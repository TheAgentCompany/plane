import React, { useState } from "react";
import { useRouter } from "next/router";
import { UseFormWatch } from "react-hook-form";
import { observer } from "mobx-react-lite";
import { X, CopyPlus } from "lucide-react";
// hooks
import { useUser } from "hooks/store";
import useToast from "hooks/use-toast";
// components
import { ExistingIssuesListModal } from "components/core";
// services
import { IssueService } from "services/issue";
// types
import { BlockeIssueDetail, TIssue, ISearchIssueResponse } from "@plane/types";

type Props = {
  issueId?: string;
  submitChanges: (formData?: Partial<TIssue>) => void;
  watch: UseFormWatch<TIssue>;
  disabled?: boolean;
};

// services
const issueService = new IssueService();

export const SidebarDuplicateSelect: React.FC<Props> = observer((props) => {
  const { issueId, submitChanges, watch, disabled = false } = props;
  // states
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  // router
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;
  // toast alert
  const { setToastAlert } = useToast();
  // store hooks
  const { currentUser } = useUser();

  const handleClose = () => {
    setIsDuplicateModalOpen(false);
  };

  const onSubmit = async (data: ISearchIssueResponse[]) => {
    if (data.length === 0) {
      setToastAlert({
        type: "error",
        title: "Error!",
        message: "Please select at least one issue.",
      });

      return;
    }

    const selectedIssues: { blocker_issue_detail: BlockeIssueDetail }[] = data.map((i) => ({
      blocker_issue_detail: {
        id: i.id,
        name: i.name,
        sequence_id: i.sequence_id,
        project_detail: {
          id: i.project_id,
          identifier: i.project__identifier,
          name: i.project__name,
        },
      },
    }));

    if (!currentUser) return;

    issueService
      .createIssueRelation(workspaceSlug as string, projectId as string, issueId as string, {
        related_list: [
          ...selectedIssues.map((issue) => ({
            issue: issueId as string,
            issue_detail: issue.blocker_issue_detail,
            related_issue: issue.blocker_issue_detail.id,
            relation_type: "duplicate" as const,
          })),
        ],
      })
      .then(() => {
        submitChanges();
      });

    handleClose();
  };

  const duplicateIssuesRelation = [
    ...(watch("related_issues")?.filter((i: any) => i.relation_type === "duplicate") ?? []),
    ...(watch("issue_relations") ?? [])
      ?.filter((i: any) => i.relation_type === "duplicate")
      .map((i: any) => ({
        ...i,
        issue_detail: i.issue_detail,
        related_issue: i.issue_detail?.id,
      })),
  ];

  return (
    <>
      <ExistingIssuesListModal
        isOpen={isDuplicateModalOpen}
        handleClose={() => setIsDuplicateModalOpen(false)}
        searchParams={{ issue_relation: true, issue_id: issueId }}
        handleOnSubmit={onSubmit}
        workspaceLevelToggle
      />
      <div className="flex flex-wrap items-start py-2">
        <div className="flex items-center gap-x-2 text-sm text-custom-text-200 sm:basis-1/2">
          <CopyPlus className="h-4 w-4 flex-shrink-0" />
          <p>Duplicate</p>
        </div>
        <div className="space-y-1 sm:basis-1/2">
          <div className="flex flex-wrap gap-1">
            {duplicateIssuesRelation && duplicateIssuesRelation.length > 0
              ? duplicateIssuesRelation.map((relation) => (
                  <div
                    key={relation.issue_detail?.id}
                    className="group flex cursor-pointer items-center gap-1 rounded-2xl border border-custom-border-200 px-1.5 py-0.5 text-xs  duration-300 "
                  >
                    <a
                      href={`/${workspaceSlug}/projects/${relation.issue_detail?.project_detail.id}/issues/${relation.issue_detail?.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <CopyPlus height={10} width={10} />
                      {`${relation.issue_detail?.project_detail.identifier}-${relation.issue_detail?.sequence_id}`}
                    </a>
                    <button
                      type="button"
                      className="opacity-0 duration-300 group-hover:opacity-100"
                      onClick={() => {
                        if (!currentUser) return;

                        issueService
                          .deleteIssueRelation(
                            workspaceSlug as string,
                            projectId as string,
                            issueId as string,
                            relation.id
                          )
                          .then(() => {
                            submitChanges();
                          });
                      }}
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </div>
                ))
              : null}
          </div>
          <button
            type="button"
            className={`rounded bg-custom-background-80 px-2.5 py-0.5 text-xs text-custom-text-200 ${
              disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-custom-background-80"
            }`}
            onClick={() => setIsDuplicateModalOpen(true)}
            disabled={disabled}
          >
            Select issues
          </button>
        </div>
      </div>
    </>
  );
});
