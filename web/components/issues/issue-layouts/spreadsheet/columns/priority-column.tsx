import React from "react";

// components
import { PrioritySelect } from "components/project";
// hooks
import useSubIssue from "hooks/use-sub-issue";
// types
import { IIssue } from "types";

type Props = {
  issue: IIssue;
  onChange: (issue: IIssue, data: Partial<IIssue>) => void;
  expandedIssues: string[];
  disabled: boolean;
};

export const SpreadsheetPriorityColumn: React.FC<Props> = ({ issue, onChange, expandedIssues, disabled }) => {
  const isExpanded = expandedIssues.indexOf(issue.id) > -1;

  const { subIssues, isLoading, mutateSubIssues } = useSubIssue(issue.project_detail?.id, issue.id, isExpanded);

  return (
    <>
      <PrioritySelect
        value={issue.priority}
        onChange={(data) => {
          onChange(issue, { priority: data });
          if (issue.parent) {
            mutateSubIssues(issue, { priority: data });
          }
        }}
        className="h-11 w-full border-b-[0.5px] border-custom-border-200"
        buttonClassName="!shadow-none !border-0 h-full w-full px-2.5 py-1"
        showTitle
        highlightUrgentPriority={false}
        hideDropdownArrow
        disabled={disabled}
      />

      {isExpanded &&
        !isLoading &&
        subIssues &&
        subIssues.length > 0 &&
        subIssues.map((subIssue: IIssue) => (
          <div className={`h-11`}>
            <SpreadsheetPriorityColumn
              key={subIssue.id}
              issue={subIssue}
              onChange={onChange}
              expandedIssues={expandedIssues}
              disabled={disabled}
            />
          </div>
        ))}
    </>
  );
};
