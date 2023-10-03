// react
import React, { useState } from "react";

// next
import { useRouter } from "next/router";

// swr
import { mutate } from "swr";

// react hook form
import { useFormContext } from "react-hook-form";

// services
import issuesService from "services/issues.service";

// hooks
import useUser from "hooks/use-user";

// fetch keys
import { ISSUE_DETAILS, PROJECT_ISSUES_ACTIVITY } from "constants/fetch-keys";

// icons
import { ChevronDown } from "lucide-react";

// components
import { IssuesSelectBottomSheet } from "components/web-view";

// types
import type { IIssue, BlockeIssueDetail, ISearchIssueResponse } from "types";

type Props = {
  disabled?: boolean;
};

export const BlockedBySelect: React.FC<Props> = (props) => {
  const { disabled = false } = props;

  const router = useRouter();
  const { workspaceSlug, projectId, issueId } = router.query;

  const { watch } = useFormContext<IIssue>();

  const { user } = useUser();

  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);

  const onSubmit = async (data: ISearchIssueResponse[]) => {
    if (!workspaceSlug || !projectId || !issueId || !user || disabled) return;

    if (data.length === 0)
      return console.log(
        "error",
        JSON.stringify({
          type: "TODO: ask mobile team",
        })
      );

    const selectedIssues: { blocked_issue_detail: BlockeIssueDetail }[] = data.map((i) => ({
      blocked_issue_detail: {
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

    const relatedIssues = watch("related_issues");

    await issuesService
      .createIssueRelation(
        workspaceSlug.toString(),
        projectId.toString(),
        issueId.toString(),
        user,
        {
          related_list: [
            ...selectedIssues.map((issue) => ({
              issue: issueId as string,
              relation_type: "blocked_by" as const,
              issue_detail: issue.blocked_issue_detail,
              related_issue: issue.blocked_issue_detail.id,
            })),
          ],
        }
      )
      .then((response) => {
        mutate(ISSUE_DETAILS(issueId as string), (prevData) => {
          if (!prevData) return prevData;
          return {
            ...prevData,
            related_issues: [...relatedIssues, ...response],
          };
        });
        mutate(PROJECT_ISSUES_ACTIVITY(issueId as string));
      });

    setIsBlockedModalOpen(false);
  };

  return (
    <>
      <IssuesSelectBottomSheet
        isOpen={isBlockedModalOpen}
        onSubmit={onSubmit}
        onClose={() => setIsBlockedModalOpen(false)}
        searchParams={{ issue_relation: true }}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsBlockedModalOpen(true)}
        className={
          "relative w-full px-2.5 py-0.5 text-base flex justify-between items-center gap-0.5 text-custom-text-100"
        }
      >
        <span className="text-custom-text-200">Select issue</span>
        <ChevronDown className="w-4 h-4 text-custom-text-200" />
      </button>
    </>
  );
};
