import { linearGradientDef } from "@nivo/core";
// types
import { TDurationFilterOptions, TIssuesListTypes, TStateGroups } from "@plane/types";

export const PRIORITY_GRAPH_GRADIENTS = [
  linearGradientDef(
    "gradientUrgent",
    [
      { offset: 0, color: "#A90408" },
      { offset: 100, color: "#DF4D51" },
    ],
    {
      x1: 1,
      y1: 0,
      x2: 0,
      y2: 0,
    }
  ),
  linearGradientDef(
    "gradientHigh",
    [
      { offset: 0, color: "#FE6B00" },
      { offset: 100, color: "#FFAC88" },
    ],
    {
      x1: 1,
      y1: 0,
      x2: 0,
      y2: 0,
    }
  ),
  linearGradientDef(
    "gradientMedium",
    [
      { offset: 0, color: "#F5AC00" },
      { offset: 100, color: "#FFD675" },
    ],
    {
      x1: 1,
      y1: 0,
      x2: 0,
      y2: 0,
    }
  ),
  linearGradientDef(
    "gradientLow",
    [
      { offset: 0, color: "#1B46DE" },
      { offset: 100, color: "#4F9BF4" },
    ],
    {
      x1: 1,
      y1: 0,
      x2: 0,
      y2: 0,
    }
  ),
  linearGradientDef(
    "gradientNone",
    [
      { offset: 0, color: "#A0A1A9" },
      { offset: 100, color: "#B9BBC6" },
    ],
    {
      x1: 1,
      y1: 0,
      x2: 0,
      y2: 0,
    }
  ),
];

export const STATE_GROUP_GRAPH_GRADIENTS = [
  linearGradientDef("gradientBacklog", [
    { offset: 0, color: "#DEDEDE" },
    { offset: 100, color: "#BABABE" },
  ]),
  linearGradientDef("gradientUnstarted", [
    { offset: 0, color: "#D4D4D4" },
    { offset: 100, color: "#878796" },
  ]),
  linearGradientDef("gradientStarted", [
    { offset: 0, color: "#FFD300" },
    { offset: 100, color: "#FAE270" },
  ]),
  linearGradientDef("gradientCompleted", [
    { offset: 0, color: "#0E8B1B" },
    { offset: 100, color: "#37CB46" },
  ]),
  linearGradientDef("gradientCanceled", [
    { offset: 0, color: "#C90004" },
    { offset: 100, color: "#FF7679" },
  ]),
];

export const STATE_GROUP_GRAPH_COLORS: Record<TStateGroups, string> = {
  backlog: "#CDCED6",
  unstarted: "#80838D",
  started: "#FFC53D",
  completed: "#3E9B4F",
  cancelled: "#E5484D",
};

export const DURATION_FILTER_OPTIONS: {
  key: TDurationFilterOptions;
  label: string;
}[] = [
  {
    key: "today",
    label: "Today",
  },
  {
    key: "this_week",
    label: "This week",
  },
  {
    key: "this_month",
    label: "This month",
  },
  {
    key: "this_year",
    label: "This year",
  },
];

export const PROJECT_BACKGROUND_COLORS = [
  "bg-gray-500/20",
  "bg-green-500/20",
  "bg-red-500/20",
  "bg-orange-500/20",
  "bg-blue-500/20",
  "bg-yellow-500/20",
  "bg-pink-500/20",
  "bg-purple-500/20",
];

export const ISSUES_TABS_LIST: {
  key: TIssuesListTypes;
  label: string;
}[] = [
  {
    key: "upcoming",
    label: "Upcoming",
  },
  {
    key: "overdue",
    label: "Overdue",
  },
  {
    key: "completed",
    label: "Completed",
  },
];
