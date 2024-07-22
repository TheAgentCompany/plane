import { TIssueActivityComment } from "@plane/types";

export enum EActivityFilterType {
  ACTIVITY = "ACTIVITY",
  COMMENT = "COMMENT",
}

export type TActivityFilters = EActivityFilterType;

export const ACTIVITY_FILTER_TYPE_OPTIONS: Record<EActivityFilterType, { label: string }> = {
  [EActivityFilterType.ACTIVITY]: {
    label: "Updates",
  },
  [EActivityFilterType.COMMENT]: {
    label: "Comments",
  },
};

export const defaultActivityFilters: TActivityFilters[] = [EActivityFilterType.ACTIVITY, EActivityFilterType.COMMENT];

export const filterActivityOnSelectedFilters = (
  activity: TIssueActivityComment[],
  filter: TActivityFilters[]
): TIssueActivityComment[] =>
  activity.filter((activity) => filter.includes(activity.activity_type as TActivityFilters));
