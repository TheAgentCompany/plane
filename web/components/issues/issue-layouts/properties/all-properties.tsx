import { observer } from "mobx-react-lite";
import { Layers, Link, Paperclip } from "lucide-react";
// components
import { IssuePropertyLabels } from "../properties/labels";
import { IssuePropertyDate } from "../properties/date";
import { Tooltip } from "@plane/ui";
import { WithDisplayPropertiesHOC } from "../properties/with-display-properties-HOC";
import { EstimateDropdown, PriorityDropdown, ProjectMemberDropdown, StateDropdown } from "components/dropdowns";
// types
import { IIssue, IIssueDisplayProperties, TIssuePriorities } from "types";

export interface IIssueProperties {
  issue: IIssue;
  handleIssues: (issue: IIssue) => void;
  displayProperties: IIssueDisplayProperties | undefined;
  isReadOnly: boolean;
  className: string;
}

export const IssueProperties: React.FC<IIssueProperties> = observer((props) => {
  const { issue, handleIssues, displayProperties, isReadOnly, className } = props;

  const handleState = (stateId: string) => {
    handleIssues({ ...issue, state: stateId });
  };

  const handlePriority = (value: TIssuePriorities) => {
    handleIssues({ ...issue, priority: value });
  };

  const handleLabel = (ids: string[]) => {
    handleIssues({ ...issue, labels: ids });
  };

  const handleAssignee = (ids: string[]) => {
    handleIssues({ ...issue, assignees: ids });
  };

  const handleStartDate = (date: string) => {
    handleIssues({ ...issue, start_date: date });
  };

  const handleTargetDate = (date: string) => {
    handleIssues({ ...issue, target_date: date });
  };

  const handleEstimate = (value: number | null) => {
    handleIssues({ ...issue, estimate_point: value });
  };

  if (!displayProperties) return null;

  return (
    <div className={className}>
      {/* basic properties */}
      {/* state */}
      <WithDisplayPropertiesHOC displayProperties={displayProperties} displayPropertyKey="state">
        <div className="h-5">
          <StateDropdown
            value={issue.state}
            onChange={handleState}
            projectId={issue.project}
            disabled={isReadOnly}
            buttonVariant="border-with-text"
          />
        </div>
      </WithDisplayPropertiesHOC>

      {/* priority */}
      <WithDisplayPropertiesHOC displayProperties={displayProperties} displayPropertyKey="priority">
        <div className="h-5">
          <PriorityDropdown
            value={issue?.priority || null}
            onChange={handlePriority}
            disabled={isReadOnly}
            buttonVariant="border-without-text"
            buttonClassName="border px-1"
          />
        </div>
      </WithDisplayPropertiesHOC>

      {/* label */}

      <WithDisplayPropertiesHOC displayProperties={displayProperties} displayPropertyKey="labels">
        <IssuePropertyLabels
          projectId={issue?.project_detail?.id || null}
          value={issue?.labels || null}
          defaultOptions={issue?.label_details ? issue.label_details : []}
          onChange={handleLabel}
          disabled={isReadOnly}
          hideDropdownArrow
        />
      </WithDisplayPropertiesHOC>

      {/* start date */}
      <WithDisplayPropertiesHOC displayProperties={displayProperties} displayPropertyKey="start_date">
        <IssuePropertyDate
          value={issue?.start_date || null}
          onChange={(date: string) => handleStartDate(date)}
          disabled={isReadOnly}
          type="start_date"
        />
      </WithDisplayPropertiesHOC>

      {/* target/due date */}
      <WithDisplayPropertiesHOC displayProperties={displayProperties} displayPropertyKey="due_date">
        <IssuePropertyDate
          value={issue?.target_date || null}
          onChange={(date: string) => handleTargetDate(date)}
          disabled={isReadOnly}
          type="target_date"
        />
      </WithDisplayPropertiesHOC>

      {/* assignee */}
      <WithDisplayPropertiesHOC displayProperties={displayProperties} displayPropertyKey="assignee">
        <div className="h-5">
          <ProjectMemberDropdown
            projectId={issue?.project}
            value={issue?.assignees}
            onChange={handleAssignee}
            disabled={isReadOnly}
            multiple
            buttonVariant={issue.assignees.length > 0 ? "transparent-without-text" : "border-without-text"}
            buttonClassName={issue.assignees.length > 0 ? "hover:bg-transparent px-0" : ""}
          />
        </div>
      </WithDisplayPropertiesHOC>

      {/* estimates */}
      <WithDisplayPropertiesHOC displayProperties={displayProperties} displayPropertyKey="estimate">
        <div className="h-5">
          <EstimateDropdown
            value={issue.estimate_point}
            onChange={handleEstimate}
            projectId={issue.project}
            disabled={isReadOnly}
            buttonVariant="border-with-text"
          />
        </div>
      </WithDisplayPropertiesHOC>

      {/* extra render properties */}
      {/* sub-issues */}
      <WithDisplayPropertiesHOC
        displayProperties={displayProperties}
        displayPropertyKey="sub_issue_count"
        shouldRenderProperty={!!issue?.sub_issues_count}
      >
        <Tooltip tooltipHeading="Sub-issues" tooltipContent={`${issue.sub_issues_count}`}>
          <div className="flex h-5 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded border-[0.5px] border-custom-border-300 px-2.5 py-1">
            <Layers className="h-3 w-3 flex-shrink-0" strokeWidth={2} />
            <div className="text-xs">{issue.sub_issues_count}</div>
          </div>
        </Tooltip>
      </WithDisplayPropertiesHOC>

      {/* attachments */}
      <WithDisplayPropertiesHOC
        displayProperties={displayProperties}
        displayPropertyKey="attachment_count"
        shouldRenderProperty={!!issue?.attachment_count}
      >
        <Tooltip tooltipHeading="Attachments" tooltipContent={`${issue.attachment_count}`}>
          <div className="flex h-5 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded border-[0.5px] border-custom-border-300 px-2.5 py-1">
            <Paperclip className="h-3 w-3 flex-shrink-0" strokeWidth={2} />
            <div className="text-xs">{issue.attachment_count}</div>
          </div>
        </Tooltip>
      </WithDisplayPropertiesHOC>

      {/* link */}
      <WithDisplayPropertiesHOC
        displayProperties={displayProperties}
        displayPropertyKey="link"
        shouldRenderProperty={!!issue?.link_count}
      >
        <Tooltip tooltipHeading="Links" tooltipContent={`${issue.link_count}`}>
          <div className="flex h-5 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded border-[0.5px] border-custom-border-300 px-2.5 py-1">
            <Link className="h-3 w-3 flex-shrink-0" strokeWidth={2} />
            <div className="text-xs">{issue.link_count}</div>
          </div>
        </Tooltip>
      </WithDisplayPropertiesHOC>
    </div>
  );
});
