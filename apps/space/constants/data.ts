// interfaces
import {
  IIssueBoardViews,
  // priority
  TIssuePriorityKey,
  // state groups
  TIssueGroupKey,
  IIssuePriorityFilters,
  IIssueGroup,
} from "store/types/issue";
// icons
import {
  BacklogStateIcon,
  UnstartedStateIcon,
  StartedStateIcon,
  CompletedStateIcon,
  CancelledStateIcon,
} from "components/icons";

// all issue views
export const issueViews: IIssueBoardViews[] = [
  {
    key: "list",
    title: "List View",
    icon: "format_list_bulleted",
    className: "",
  },
  {
    key: "kanban",
    title: "Board View",
    icon: "grid_view",
    className: "",
  },
  // {
  //   key: "calendar",
  //   title: "Calendar View",
  //   icon: "calendar_month",
  //   className: "",
  // },
  // {
  //   key: "spreadsheet",
  //   title: "Spreadsheet View",
  //   icon: "table_chart",
  //   className: "",
  // },
  // {
  //   key: "gantt",
  //   title: "Gantt Chart View",
  //   icon: "waterfall_chart",
  //   className: "rotate-90",
  // },
];

// issue priority filters
export const issuePriorityFilters: IIssuePriorityFilters[] = [
  {
    key: "urgent",
    title: "Urgent",
    className: "bg-red-500/10 text-red-500",
    icon: "error",
  },
  {
    key: "high",
    title: "High",
    className: "bg-orange-500/10 text-orange-500",
    icon: "signal_cellular_alt",
  },
  {
    key: "medium",
    title: "Medium",
    className: "bg-yellow-500/10 text-yellow-500",
    icon: "signal_cellular_alt_2_bar",
  },
  {
    key: "low",
    title: "Low",
    className: "bg-green-500/10 text-green-500",
    icon: "signal_cellular_alt_1_bar",
  },
  {
    key: "none",
    title: "None",
    className: "bg-gray-500/10 text-gray-500",
    icon: "block",
  },
];

export const issuePriorityFilter = (priorityKey: TIssuePriorityKey): IIssuePriorityFilters | null => {
  const currentIssuePriority: IIssuePriorityFilters | undefined | null =
    issuePriorityFilters && issuePriorityFilters.length > 0
      ? issuePriorityFilters.find((_priority) => _priority.key === priorityKey)
      : null;

  if (currentIssuePriority === undefined || currentIssuePriority === null) return null;
  return { ...currentIssuePriority };
};

// issue group filters
export const issueGroupColors: {
  [key: string]: string;
} = {
  backlog: "#d9d9d9",
  unstarted: "#3f76ff",
  started: "#f59e0b",
  completed: "#16a34a",
  cancelled: "#dc2626",
};

export const issueGroups: IIssueGroup[] = [
  {
    key: "backlog",
    title: "Backlog",
    color: "#d9d9d9",
    className: `text-[#d9d9d9] bg-[#d9d9d9]/10`,
    icon: BacklogStateIcon,
  },
  {
    key: "unstarted",
    title: "Unstarted",
    color: "#3f76ff",
    className: `text-[#3f76ff] bg-[#3f76ff]/10`,
    icon: UnstartedStateIcon,
  },
  {
    key: "started",
    title: "Started",
    color: "#f59e0b",
    className: `text-[#f59e0b] bg-[#f59e0b]/10`,
    icon: StartedStateIcon,
  },
  {
    key: "completed",
    title: "Completed",
    color: "#16a34a",
    className: `text-[#16a34a] bg-[#16a34a]/10`,
    icon: CompletedStateIcon,
  },
  {
    key: "cancelled",
    title: "Cancelled",
    color: "#dc2626",
    className: `text-[#dc2626] bg-[#dc2626]/10`,
    icon: CancelledStateIcon,
  },
];

export const issueGroupFilter = (issueKey: TIssueGroupKey): IIssueGroup | null => {
  const currentIssueStateGroup: IIssueGroup | undefined | null =
    issueGroups && issueGroups.length > 0 ? issueGroups.find((group) => group.key === issueKey) : null;

  if (currentIssueStateGroup === undefined || currentIssueStateGroup === null) return null;
  return { ...currentIssueStateGroup };
};
