"use client";

// types
import { TIssuePriorityKey } from "store/types/issue";
// constants
import { issuePriorityFilter } from "constants/data";

export const IssueBlockPriority = ({ priority }: { priority: TIssuePriorityKey | null }) => {
  const priority_detail = priority != null ? issuePriorityFilter(priority) : null;

  if (priority_detail === null) return <></>;
  return (
    <div className={`h-6 w-6 rounded flex justify-center items-center ${priority_detail?.className}`}>
      <span className="material-symbols-rounded text-sm">{priority_detail?.icon}</span>
    </div>
  );
};
