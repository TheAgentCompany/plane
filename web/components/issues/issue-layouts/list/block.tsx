import { Dispatch, MouseEvent, SetStateAction, useEffect, useRef } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { observer } from "mobx-react-lite";
import { ChevronRight } from "lucide-react";
// types
import { TIssue, IIssueDisplayProperties, TIssueMap } from "@plane/types";
// ui
import { Spinner, Tooltip, ControlLink, DragHandle } from "@plane/ui";
// components
import { MultipleSelectAction } from "@/components/core";
import { IssueProperties } from "@/components/issues/issue-layouts/properties";
// helpers
import { cn } from "@/helpers/common.helper";
// hooks
import { useAppRouter, useIssueDetail, useProject } from "@/hooks/store";
import { TSelectionHelper } from "@/hooks/use-multiple-select";
import { usePlatformOS } from "@/hooks/use-platform-os";
// types
import { TRenderQuickActions } from "./list-view-types";

interface IssueBlockProps {
  issueId: string;
  issuesMap: TIssueMap;
  groupId: string;
  updateIssue: ((projectId: string, issueId: string, data: Partial<TIssue>) => Promise<void>) | undefined;
  quickActions: TRenderQuickActions;
  displayProperties: IIssueDisplayProperties | undefined;
  canEditProperties: (projectId: string | undefined) => boolean;
  nestingLevel: number;
  spacingLeft?: number;
  isExpanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  selectionHelpers: TSelectionHelper;
  isCurrentBlockDragging: boolean;
  setIsCurrentBlockDragging: React.Dispatch<React.SetStateAction<boolean>>;
  canDrag: boolean;
}

export const IssueBlock = observer((props: IssueBlockProps) => {
  const {
    issuesMap,
    issueId,
    groupId,
    updateIssue,
    quickActions,
    displayProperties,
    canEditProperties,
    nestingLevel,
    spacingLeft = 14,
    isExpanded,
    setExpanded,
    selectionHelpers,
    isCurrentBlockDragging,
    setIsCurrentBlockDragging,
    canDrag,
  } = props;
  // ref
  const issueRef = useRef<HTMLDivElement | null>(null);
  const dragHandleRef = useRef(null);
  // hooks
  const { workspaceSlug } = useAppRouter();
  const { getProjectIdentifierById } = useProject();
  const { getIsIssuePeeked, peekIssue, setPeekIssue, subIssues: subIssuesStore } = useIssueDetail();

  const handleIssuePeekOverview = (issue: TIssue) =>
    workspaceSlug &&
    issue &&
    issue.project_id &&
    issue.id &&
    !getIsIssuePeeked(issue.id) &&
    setPeekIssue({ workspaceSlug, projectId: issue.project_id, issueId: issue.id, nestingLevel: nestingLevel });

  const issue = issuesMap[issueId];
  const subIssuesCount = issue.sub_issues_count;

  const { isMobile } = usePlatformOS();

  useEffect(() => {
    const element = issueRef.current;
    const dragHandleElement = dragHandleRef.current;

    if (!element || !dragHandleElement) return;

    return combine(
      draggable({
        element,
        dragHandle: dragHandleElement,
        canDrag: () => canDrag,
        getInitialData: () => ({ id: issueId, type: "ISSUE", groupId }),
        onDragStart: () => {
          setIsCurrentBlockDragging(true);
        },
        onDrop: () => {
          setIsCurrentBlockDragging(false);
        },
      })
    );
  }, [issueRef?.current, canDrag, issueId, groupId, dragHandleRef?.current, setIsCurrentBlockDragging]);

  if (!issue) return null;

  const canEditIssueProperties = canEditProperties(issue.project_id);
  const projectIdentifier = getProjectIdentifierById(issue.project_id);
  const isIssueSelected = selectionHelpers.isEntitySelected(issue.id);
  const isIssueActive = selectionHelpers.isEntityActive(issue.id);

  // if sub issues have been fetched for the issue, use that for count or use issue's sub_issues_count
  // const subIssuesCount = subIssues ? subIssues.length : issue.sub_issues_count;

  const paddingLeft = `${spacingLeft}px`;

  const handleToggleExpand = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (nestingLevel >= 3) {
      handleIssuePeekOverview(issue);
    } else {
      setExpanded((prevState) => {
        if (!prevState && workspaceSlug && issue)
          subIssuesStore.fetchSubIssues(workspaceSlug.toString(), issue.project_id, issue.id);
        return !prevState;
      });
    }
  };

  return (
    <div
      ref={issueRef}
      className={cn(
        "group/list-block min-h-11 relative flex flex-col md:flex-row md:items-center gap-3 bg-custom-background-100 p-3 pl-1.5 text-sm transition-colors issue-list-block",
        {
          "border border-custom-primary-70 hover:border-custom-primary-70":
            getIsIssuePeeked(issue.id) && peekIssue?.nestingLevel === nestingLevel,
          "last:border-b-transparent": !getIsIssuePeeked(issue.id),
          "hover:bg-custom-background-90": !isIssueSelected,
          "bg-custom-primary-100/5 hover:bg-custom-primary-100/10": isIssueSelected,
          "bg-custom-background-80": isCurrentBlockDragging,
        }
      )}
      style={
        isIssueActive
          ? {
              boxShadow:
                "inset 1px 1px 2px rgba(var(--color-primary-100), 0.15), inset -1px -1px 2px rgba(var(--color-primary-100), 0.15)",
            }
          : {}
      }
    >
      <div className="flex w-full truncate" style={nestingLevel !== 0 ? { paddingLeft } : {}}>
        <div className="flex flex-grow items-center gap-3 truncate">
          <div className="flex items-center gap-0.5">
            <div className="flex items-center group">
              <DragHandle isDragging={isCurrentBlockDragging} ref={dragHandleRef} disabled={!canDrag} />
              {canEditIssueProperties && (
                <div className="flex-shrink-0 grid place-items-center w-3.5 pl-1.5">
                  <MultipleSelectAction
                    className={cn(
                      "opacity-0 pointer-events-none group-hover/list-block:opacity-100 group-hover/list-block:pointer-events-auto transition-opacity",
                      {
                        "opacity-100 pointer-events-auto": isIssueSelected,
                      }
                    )}
                    groupId={groupId}
                    id={issue.id}
                    selectionHelpers={selectionHelpers}
                  />
                </div>
              )}
              <div className="flex h-5 w-5 items-center justify-center">
                {subIssuesCount > 0 && (
                  <button
                    className="flex items-center justify-center h-5 w-5 cursor-pointer rounded-sm text-custom-text-400  hover:text-custom-text-300"
                    onClick={handleToggleExpand}
                  >
                    <ChevronRight className={`size-4 ${isExpanded ? "rotate-90" : ""}`} />
                  </button>
                )}
              </div>
            </div>
            {displayProperties && displayProperties?.key && (
              <div className="flex-shrink-0 text-xs font-medium text-custom-text-300">
                {projectIdentifier}-{issue.sequence_id}
              </div>
            )}

            {issue?.tempId !== undefined && (
              <div className="absolute left-0 top-0 z-[99999] h-full w-full animate-pulse bg-custom-background-100/20" />
            )}
          </div>

          {issue?.is_draft ? (
            <Tooltip tooltipContent={issue.name} isMobile={isMobile} position="top-left">
              <p className="truncate">{issue.name}</p>
            </Tooltip>
          ) : (
            <ControlLink
              id={`issue-${issue.id}`}
              href={`/${workspaceSlug}/projects/${issue.project_id}/${issue.archived_at ? "archives/" : ""}issues/${
                issue.id
              }`}
              target="_blank"
              onClick={() => handleIssuePeekOverview(issue)}
              className="w-full truncate cursor-pointer text-sm text-custom-text-100"
              disabled={!!issue?.tempId}
            >
              <Tooltip tooltipContent={issue.name} isMobile={isMobile} position="top-left">
                <p className="truncate">{issue.id}</p>
              </Tooltip>
            </ControlLink>
          )}
        </div>
        {!issue?.tempId && (
          <div className="block md:hidden border border-custom-border-300 rounded">
            {quickActions({
              issue,
              parentRef: issueRef,
            })}
          </div>
        )}
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        {!issue?.tempId ? (
          <>
            <IssueProperties
              className="relative flex flex-wrap md:flex-grow md:flex-shrink-0 items-center gap-2 whitespace-nowrap"
              issue={issue}
              isReadOnly={!canEditIssueProperties}
              updateIssue={updateIssue}
              displayProperties={displayProperties}
              activeLayout="List"
            />
            <div className="hidden md:block">
              {quickActions({
                issue,
                parentRef: issueRef,
              })}
            </div>
          </>
        ) : (
          <div className="h-4 w-4">
            <Spinner className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
});
