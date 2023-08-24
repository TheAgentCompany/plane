"use client";

// mobx react lite
import { observer } from "mobx-react-lite";
// components
import { IssueBlockPriority } from "components/issues/board-views/block-priority";
import { IssueBlockState } from "components/issues/board-views/block-state";
import { IssueBlockLabels } from "components/issues/board-views/block-labels";
import { IssueBlockDueDate } from "components/issues/board-views/block-due-date";
// mobx hook
import { useMobxStore } from "lib/mobx/store-provider";
// interfaces
import { IIssue } from "store/types/issue";
import { RootStore } from "store/root";

export const IssueListBlock = ({ issue }: { issue: IIssue }) => {
  const store: RootStore = useMobxStore();

  return (
    <div className="p-3.5 h-[118px] flex flex-col justify-between bg-white space-y-2 rounded shadow">
      {/* id */}
      <div className="flex-shrink-0 text-xs font-medium text-gray-600 w-[60px]">
        {store?.project?.project?.identifier}-{issue?.sequence_id}
      </div>

      {/* name */}
      <div className="text-gray-800 text-sm font-medium h-full break-words line-clamp-2">{issue.name}</div>

      {/* priority */}
      <div className="relative flex flex-wrap items-center gap-2 w-full">
        {issue?.priority && (
          <div className="flex-shrink-0">
            <IssueBlockPriority priority={issue?.priority} />
          </div>
        )}
        {/* state */}
        {issue?.state_detail && (
          <div className="flex-shrink-0">
            <IssueBlockState state={issue?.state_detail} />
          </div>
        )}
        {/* labels */}
        {issue?.label_details && issue?.label_details.length > 0 && (
          <div className="flex-shrink-0">
            <IssueBlockLabels labels={issue?.label_details} />
          </div>
        )}
        {/* due date */}
        {issue?.target_date && (
          <div className="flex-shrink-0">
            <IssueBlockDueDate due_date={issue?.target_date} group={issue?.state_detail?.group} />
          </div>
        )}
      </div>
    </div>
  );
};
