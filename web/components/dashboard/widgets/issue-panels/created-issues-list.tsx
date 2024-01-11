import Link from "next/link";
// hooks
import { useIssueDetail } from "hooks/store";
// components
import {
  CreatedCompletedIssueListItem,
  CreatedOverdueIssueListItem,
  CreatedUpcomingIssueListItem,
} from "components/dashboard";
// ui
import { Button, Loader } from "@plane/ui";
// helpers
import { renderFormattedPayloadDate } from "helpers/date-time.helper";
import { cn } from "helpers/common.helper";
// types
import { TIssuesListTypes, TWidgetIssue } from "@plane/types";

type Props = {
  issues: TWidgetIssue[];
  isLoading?: boolean;
  totalIssues: number;
  type: TIssuesListTypes;
  workspaceSlug: string;
};

export const CreatedIssuesList: React.FC<Props> = (props) => {
  const { issues, isLoading = false, totalIssues, type, workspaceSlug } = props;
  // store hooks
  const { setPeekIssue } = useIssueDetail();

  const handleIssuePeekOverview = (issue: TWidgetIssue) =>
    setPeekIssue({ workspaceSlug, projectId: issue.project, issueId: issue.id });

  const today = renderFormattedPayloadDate(new Date());
  const filterParams =
    type === "upcoming"
      ? `?target_date=${today};after`
      : type === "overdue"
      ? `?target_date=${today};before`
      : "?state_group=completed";

  return (
    <>
      <div>
        <div className="mx-6 border-b-[0.5px] border-custom-border-200 grid grid-cols-6 gap-1 text-xs text-custom-text-300 pb-1">
          <h6
            className={cn("pl-1 flex items-center gap-1 col-span-4", {
              "col-span-5": type === "completed",
            })}
          >
            Issues
            <span className="flex-shrink-0 bg-custom-primary-100/20 text-custom-primary-100 text-xs font-medium py-1 px-1.5 rounded-xl h-4 min-w-6 flex items-center text-center justify-center">
              {totalIssues}
            </span>
          </h6>
          {type === "upcoming" && <h6 className="text-center">Due date</h6>}
          {type === "overdue" && <h6 className="text-center">Due by</h6>}
          <h6 className="text-center">Assigned to</h6>
        </div>
        <div className="px-4 mt-2">
          {isLoading ? (
            <Loader className="mx-3 space-y-4">
              <Loader.Item height="25px" />
              <Loader.Item height="25px" />
              <Loader.Item height="25px" />
              <Loader.Item height="25px" />
            </Loader>
          ) : (
            issues.map((issue) => {
              if (type === "upcoming")
                return (
                  <CreatedUpcomingIssueListItem
                    key={issue.id}
                    issue={issue}
                    workspaceSlug={workspaceSlug}
                    onClick={handleIssuePeekOverview}
                  />
                );
              if (type === "overdue")
                return (
                  <CreatedOverdueIssueListItem
                    key={issue.id}
                    issue={issue}
                    workspaceSlug={workspaceSlug}
                    onClick={handleIssuePeekOverview}
                  />
                );
              if (type === "completed")
                return (
                  <CreatedCompletedIssueListItem
                    key={issue.id}
                    issue={issue}
                    workspaceSlug={workspaceSlug}
                    onClick={handleIssuePeekOverview}
                  />
                );
            })
          )}
        </div>
      </div>
      {totalIssues > issues.length && (
        <Link href={`/${workspaceSlug}/workspace-views/created/${filterParams}`} className="block mt-6 text-center">
          <Button type="button" variant="accent-primary" className="py-1 px-2 text-xs">
            View all issues
          </Button>
        </Link>
      )}
    </>
  );
};
