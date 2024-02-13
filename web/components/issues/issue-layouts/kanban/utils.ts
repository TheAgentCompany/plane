import { DraggableLocation } from "@hello-pangea/dnd";
import { TGroupedIssues, IIssueMap, TSubGroupedIssues, TUnGroupedIssues, TIssue } from "@plane/types";

const handleSortOrder = (destinationIssues: string[], destinationIndex: number, issueMap: IIssueMap) => {
  const sortOrderDefaultValue = 65535;
  let currentIssueState = {};

  if (destinationIssues && destinationIssues.length > 0) {
    if (destinationIndex === 0) {
      const destinationIssueId = destinationIssues[destinationIndex];
      currentIssueState = {
        ...currentIssueState,
        sort_order: issueMap[destinationIssueId].sort_order - sortOrderDefaultValue,
      };
    } else if (destinationIndex === destinationIssues.length) {
      const destinationIssueId = destinationIssues[destinationIndex - 1];
      currentIssueState = {
        ...currentIssueState,
        sort_order: issueMap[destinationIssueId].sort_order + sortOrderDefaultValue,
      };
    } else {
      const destinationTopIssueId = destinationIssues[destinationIndex - 1];
      const destinationBottomIssueId = destinationIssues[destinationIndex];
      currentIssueState = {
        ...currentIssueState,
        sort_order: (issueMap[destinationTopIssueId].sort_order + issueMap[destinationBottomIssueId].sort_order) / 2,
      };
    }
  } else {
    currentIssueState = {
      ...currentIssueState,
      sort_order: sortOrderDefaultValue,
    };
  }

  return currentIssueState;
};

export const handleDragDrop = async (
  source: DraggableLocation | null | undefined,
  destination: DraggableLocation | null | undefined,
  workspaceSlug: string | undefined,
  projectId: string | undefined, // projectId for all views or user id in profile issues
  subGroupBy: string | null,
  groupBy: string | null,
  issueMap: IIssueMap,
  issueWithIds: TGroupedIssues | TSubGroupedIssues | TUnGroupedIssues | undefined,
  updateIssue: (
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: Partial<TIssue>
  ) => Promise<TIssue | undefined>,
  removeIssue: (workspaceSlug: string, projectId: string, issueId: string) => Promise<TIssue | undefined>
) => {
  if (!issueMap || !issueWithIds || !source || !destination || !workspaceSlug || !projectId) return;

  let updatedIssue: any = {};

  const sourceColumnId = (source?.droppableId && source?.droppableId.split("__")) || null;
  const destinationColumnId = (destination?.droppableId && destination?.droppableId.split("__")) || null;

  if (!sourceColumnId || !destinationColumnId) return;

  const sourceGroupByColumnId = sourceColumnId[0] || null;
  const destinationGroupByColumnId = destinationColumnId[0] || null;

  const sourceSubGroupByColumnId = sourceColumnId[1] || null;
  const destinationSubGroupByColumnId = destinationColumnId[1] || null;

  if (
    !workspaceSlug ||
    !projectId ||
    !groupBy ||
    !sourceGroupByColumnId ||
    !destinationGroupByColumnId ||
    !sourceSubGroupByColumnId ||
    !destinationSubGroupByColumnId
  )
    return;

  if (destinationGroupByColumnId === "issue-trash-box") {
    const sourceIssues: string[] = subGroupBy
      ? (issueWithIds as TSubGroupedIssues)[sourceSubGroupByColumnId][sourceGroupByColumnId]
      : (issueWithIds as TGroupedIssues)[sourceGroupByColumnId];

    const [removed] = sourceIssues.splice(source.index, 1);

    if (removed) {
      return await removeIssue(workspaceSlug, projectId, removed);
    }
  } else {
    //spreading the array to stop changing the original reference
    //since we are removing an id from array further down
    const sourceIssues = [
      ...(subGroupBy
        ? (issueWithIds as TSubGroupedIssues)[sourceSubGroupByColumnId][sourceGroupByColumnId]
        : (issueWithIds as TGroupedIssues)[sourceGroupByColumnId]),
    ];
    const destinationIssues = subGroupBy
      ? (issueWithIds as TSubGroupedIssues)[sourceSubGroupByColumnId][destinationGroupByColumnId]
      : (issueWithIds as TGroupedIssues)[destinationGroupByColumnId];

    const [removed] = sourceIssues.splice(source.index, 1);
    const removedIssueDetail = issueMap[removed];

    updatedIssue = {
      id: removedIssueDetail?.id,
      project_id: removedIssueDetail?.project_id,
    };

    // for both horizontal and vertical dnd
    updatedIssue = {
      ...updatedIssue,
      ...handleSortOrder(destinationIssues, destination.index, issueMap),
    };

    if (subGroupBy && sourceSubGroupByColumnId && destinationSubGroupByColumnId) {
      if (sourceSubGroupByColumnId === destinationSubGroupByColumnId) {
        if (sourceGroupByColumnId != destinationGroupByColumnId) {
          if (groupBy === "state") updatedIssue = { ...updatedIssue, state_id: destinationGroupByColumnId };
          if (groupBy === "priority") updatedIssue = { ...updatedIssue, priority: destinationGroupByColumnId };
        }
      } else {
        if (subGroupBy === "state")
          updatedIssue = {
            ...updatedIssue,
            state_id: destinationSubGroupByColumnId,
            priority: destinationGroupByColumnId,
          };
        if (subGroupBy === "priority")
          updatedIssue = {
            ...updatedIssue,
            state_id: destinationGroupByColumnId,
            priority: destinationSubGroupByColumnId,
          };
      }
    } else {
      // for horizontal dnd
      if (sourceColumnId != destinationColumnId) {
        if (groupBy === "state") updatedIssue = { ...updatedIssue, state_id: destinationGroupByColumnId };
        if (groupBy === "priority") updatedIssue = { ...updatedIssue, priority: destinationGroupByColumnId };
      }
    }

    if (updatedIssue && updatedIssue?.id) {
      return await updateIssue(workspaceSlug, updatedIssue.project_id, updatedIssue.id, updatedIssue);
    }
  }
};
