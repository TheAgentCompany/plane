import React from "react";

// components
import { StateColumn } from "components/core";
// hooks
import useSubIssue from "hooks/use-sub-issue";
// types
import { ICurrentUserResponse, IIssue, Properties } from "types";

type Props = {
  issue: IIssue;
  projectId: string;
  handleUpdateIssue: (issueId: string, data: Partial<IIssue>) => void;
  expandedIssues: string[];
  properties: Properties;
  user: ICurrentUserResponse | undefined;
  isNotAllowed: boolean;
};

export const SpreadsheetStateColumn: React.FC<Props> = ({
  issue,
  projectId,
  handleUpdateIssue,
  expandedIssues,
  properties,
  user,
  isNotAllowed,
}) => {
  const isExpanded = expandedIssues.indexOf(issue.id) > -1;

  const { subIssues, isLoading } = useSubIssue(issue.project_detail.id, issue.id, isExpanded);

  return (
    <div>
      <StateColumn
        issue={issue}
        projectId={projectId}
        properties={properties}
        onChange={(data) => handleUpdateIssue(issue.id, data)}
        user={user}
        isNotAllowed={isNotAllowed}
      />

      {isExpanded &&
        !isLoading &&
        subIssues &&
        subIssues.length > 0 &&
        subIssues.map((subIssue) => (
          <SpreadsheetStateColumn
            key={subIssue.id}
            issue={subIssue}
            projectId={subIssue.project_detail.id}
            handleUpdateIssue={handleUpdateIssue}
            expandedIssues={expandedIssues}
            properties={properties}
            user={user}
            isNotAllowed={isNotAllowed}
          />
        ))}
    </div>
  );
};
