import { FC } from "react";
// components
import { IssueBlock } from "components/issues";
// types
import { IGroupedIssues, IIssue, IIssueDisplayProperties, IIssueMap, TUnGroupedIssues } from "types";
import { EIssueActions } from "../types";

interface Props {
  issueIds: IGroupedIssues | TUnGroupedIssues | any;
  issuesMap: IIssueMap;
  canEditProperties: (projectId: string | undefined) => boolean;
  handleIssues: (issue: IIssue, action: EIssueActions) => void;
  quickActions: (issue: IIssue) => React.ReactNode;
  displayProperties: IIssueDisplayProperties | undefined;
}

export const IssueBlocksList: FC<Props> = (props) => {
  const { issueIds, issuesMap, handleIssues, quickActions, displayProperties, canEditProperties } = props;

  return (
    <div className="relative h-full w-full divide-y-[0.5px] divide-custom-border-200">
      {issueIds && issueIds.length > 0 ? (
        issueIds.map((issueId: string) => {
          if (!issueId) return null;

          return (
            <IssueBlock
              key={issueId}
              issueId={issueId}
              issuesMap={issuesMap}
              handleIssues={handleIssues}
              quickActions={quickActions}
              canEditProperties={canEditProperties}
              displayProperties={displayProperties}
            />
          );
        })
      ) : (
        <div className="bg-custom-background-100 p-3 text-sm text-custom-text-400">No issues</div>
      )}
    </div>
  );
};
