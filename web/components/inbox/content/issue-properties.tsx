import React from "react";
import { observer } from "mobx-react-lite";
import { CalendarCheck2, Signal, Tag } from "lucide-react";

// hooks
// components
import { DoubleCircleIcon, UserGroupIcon } from "@plane/ui";
import { DateDropdown, PriorityDropdown, MemberDropdown, StateDropdown } from "@/components/dropdowns";
import { IssueLabel, TIssueOperations } from "@/components/issues";
// icons
// helper
import { getDate, renderFormattedPayloadDate } from "@/helpers/date-time.helper";
import { useProjectInbox } from "@/hooks/store";

type Props = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  issueOperations: TIssueOperations;
  is_editable: boolean;
};

export const InboxIssueProperties: React.FC<Props> = observer((props) => {
  const { workspaceSlug, projectId, issueId, issueOperations, is_editable } = props;
  // store hooks
  const { getIssueInboxByIssueId } = useProjectInbox();

  const issue = getIssueInboxByIssueId(issueId)?.issue;
  if (!issue) return <></>;

  const minDate = issue.start_date ? getDate(issue.start_date) : null;
  minDate?.setDate(minDate.getDate());

  return (
    <div className="flex h-min w-full flex-col divide-y-2 divide-custom-border-200 overflow-hidden">
      <div className="h-min w-full overflow-y-auto px-5">
        <h5 className="text-sm font-medium my-4">Properties</h5>
        <div className={`divide-y-2 divide-custom-border-200 ${!is_editable ? "opacity-60" : ""}`}>
          <div className="flex flex-col gap-3">
            {/* State */}
            <div className="flex items-center gap-2 h-8">
              <div className="flex items-center gap-1 w-2/5 flex-shrink-0 text-sm text-custom-text-300">
                <DoubleCircleIcon className="h-4 w-4 flex-shrink-0" />
                <span>State</span>
              </div>
              {issue?.state_id && (
                <StateDropdown
                  value={issue?.state_id}
                  onChange={(val) => issueOperations.update(workspaceSlug, projectId, issueId, { state_id: val })}
                  projectId={projectId?.toString() ?? ""}
                  disabled={!is_editable}
                  buttonVariant="transparent-with-text"
                  className="w-3/5 flex-grow group"
                  buttonContainerClassName="w-full text-left"
                  buttonClassName="text-sm"
                  dropdownArrow
                  dropdownArrowClassName="h-3.5 w-3.5 hidden group-hover:inline"
                />
              )}
            </div>
            {/* Assignee */}
            <div className="flex items-center gap-2 h-8">
              <div className="flex items-center gap-1 w-2/5 flex-shrink-0 text-sm text-custom-text-300">
                <UserGroupIcon className="h-4 w-4 flex-shrink-0" />
                <span>Assignees</span>
              </div>
              <MemberDropdown
                value={issue?.assignee_ids ?? []}
                onChange={(val) => issueOperations.update(workspaceSlug, projectId, issueId, { assignee_ids: val })}
                disabled={!is_editable}
                projectId={projectId?.toString() ?? ""}
                placeholder="Add assignees"
                multiple
                buttonVariant={
                  (issue?.assignee_ids || [])?.length > 0 ? "transparent-without-text" : "transparent-with-text"
                }
                className="w-3/5 flex-grow group"
                buttonContainerClassName="w-full text-left"
                buttonClassName={`text-sm justify-between ${
                  (issue?.assignee_ids || [])?.length > 0 ? "" : "text-custom-text-400"
                }`}
                hideIcon={issue.assignee_ids?.length === 0}
                dropdownArrow
                dropdownArrowClassName="h-3.5 w-3.5 hidden group-hover:inline"
              />
            </div>
            {/* Priority */}
            <div className="flex items-center gap-2 h-8">
              <div className="flex items-center gap-1 w-2/5 flex-shrink-0 text-sm text-custom-text-300">
                <Signal className="h-4 w-4 flex-shrink-0" />
                <span>Priority</span>
              </div>
              <PriorityDropdown
                value={issue?.priority || "none"}
                onChange={(val) => issueOperations.update(workspaceSlug, projectId, issueId, { priority: val })}
                disabled={!is_editable}
                buttonVariant="border-with-text"
                className="w-3/5 flex-grow rounded px-2 hover:bg-custom-background-80"
                buttonContainerClassName="w-full text-left"
                buttonClassName="w-min h-auto whitespace-nowrap"
              />
            </div>
          </div>
        </div>
        <div className={`divide-y-2 divide-custom-border-200 mt-3 ${!is_editable ? "opacity-60" : ""}`}>
          <div className="flex flex-col gap-3">
            {/* Due Date */}
            <div className="flex items-center gap-2 h-8">
              <div className="flex items-center gap-1 w-2/5 flex-shrink-0 text-sm text-custom-text-300">
                <CalendarCheck2 className="h-4 w-4 flex-shrink-0" />
                <span>Due date</span>
              </div>
              <DateDropdown
                placeholder="Add due date"
                value={issue.target_date || null}
                onChange={(val) =>
                  issueOperations.update(workspaceSlug, projectId, issueId, {
                    target_date: val ? renderFormattedPayloadDate(val) : null,
                  })
                }
                minDate={minDate ?? undefined}
                disabled={!is_editable}
                buttonVariant="transparent-with-text"
                className="w-3/5 flex-grow group"
                buttonContainerClassName="w-full text-left"
                buttonClassName={`text-sm ${issue?.target_date ? "" : "text-custom-text-400"}`}
                hideIcon
                clearIconClassName="h-3 w-3 hidden group-hover:inline"
              />
            </div>
            {/* Labels */}
            <div className="flex items-center gap-2 min-h-8">
              <div className="flex items-center gap-1 w-2/5 flex-shrink-0 text-sm text-custom-text-300">
                <Tag className="h-4 w-4 flex-shrink-0" />
                <span>Labels</span>
              </div>
              <div className="w-3/5 flex-grow min-h-8 h-full pt-1">
                <IssueLabel
                  workspaceSlug={workspaceSlug}
                  projectId={projectId}
                  issueId={issueId}
                  disabled={!is_editable}
                  isInboxIssue
                  onLabelUpdate={(val: string[]) =>
                    issueOperations.update(workspaceSlug, projectId, issueId, { label_ids: val })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
