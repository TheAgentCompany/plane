// components
import { IssueBlocksList, ListQuickAddIssueForm } from "components/issues";
// hooks
import { useLabel, useProject, useProjectState } from "hooks/store";
// types
import {
  GroupByColumnTypes,
  IGroupedIssues,
  IIssue,
  IIssueDisplayProperties,
  IIssueMap,
  TUnGroupedIssues,
} from "types";
import { EIssueActions } from "../types";
// constants
import { EProjectStore } from "store/application/command-palette.store";
import { HeaderGroupByCard } from "./headers/group-by-card";
import { getGroupByColumns } from "../utils";

export interface IGroupByList {
  issueIds: IGroupedIssues | TUnGroupedIssues | any;
  issuesMap: IIssueMap;
  group_by: string | null;
  is_list?: boolean;
  handleIssues: (issue: IIssue, action: EIssueActions) => Promise<void>;
  quickActions: (issue: IIssue) => React.ReactNode;
  displayProperties: IIssueDisplayProperties | undefined;
  enableIssueQuickAdd: boolean;
  showEmptyGroup?: boolean;
  canEditProperties: (projectId: string | undefined) => boolean;
  quickAddCallback?: (
    workspaceSlug: string,
    projectId: string,
    data: IIssue,
    viewId?: string
  ) => Promise<IIssue | undefined>;
  disableIssueCreation?: boolean;
  currentStore: EProjectStore;
  addIssuesToView?: (issueIds: string[]) => Promise<IIssue>;
  viewId?: string;
}

const GroupByList: React.FC<IGroupByList> = (props) => {
  const {
    issueIds,
    issuesMap,
    group_by,
    is_list = false,
    handleIssues,
    quickActions,
    displayProperties,
    enableIssueQuickAdd,
    showEmptyGroup,
    canEditProperties,
    quickAddCallback,
    viewId,
    disableIssueCreation,
    currentStore,
    addIssuesToView,
  } = props;
  // store hooks
  const project = useProject();
  const projectLabel = useLabel();
  const projectState = useProjectState();

  const list = getGroupByColumns(group_by as GroupByColumnTypes, project, projectLabel, projectState);

  if (!list) return null;

  const prePopulateQuickAddData = (groupByKey: string | null, value: any) => {
    const defaultState = projectState.projectStates?.find((state) => state.default);
    if (groupByKey === null) return { state: defaultState?.id };
    else {
      if (groupByKey === "state") return { state: groupByKey === "state" ? value : defaultState?.id };
      else return { state: defaultState?.id, [groupByKey]: value };
    }
  };

  const validateEmptyIssueGroups = (issues: IIssue[]) => {
    const issuesCount = issues?.length || 0;
    if (!showEmptyGroup && issuesCount <= 0) return false;
    return true;
  };

  return (
    <div className="relative h-full w-full">
      {list &&
        list.length > 0 &&
        list.map(
          (_list: any) =>
            validateEmptyIssueGroups(is_list ? issueIds : issueIds?.[_list.id]) && (
              <div key={_list.id} className={`flex flex-shrink-0 flex-col`}>
                <div className="sticky top-0 z-[2] w-full flex-shrink-0 border-b border-custom-border-200 bg-custom-background-90 px-3 py-1">
                  <HeaderGroupByCard
                    icon={_list.icon}
                    title={_list.name || ""}
                    count={is_list ? issueIds?.length || 0 : issueIds?.[_list.id]?.length || 0}
                    issuePayload={_list.payload}
                    disableIssueCreation={disableIssueCreation}
                    currentStore={currentStore}
                    addIssuesToView={addIssuesToView}
                  />
                </div>

                {issueIds && (
                  <IssueBlocksList
                    issueIds={is_list ? issueIds || 0 : issueIds?.[_list.id] || 0}
                    issuesMap={issuesMap}
                    handleIssues={handleIssues}
                    quickActions={quickActions}
                    displayProperties={displayProperties}
                    canEditProperties={canEditProperties}
                  />
                )}

                {enableIssueQuickAdd && !disableIssueCreation && (
                  <div className="sticky bottom-0 z-[1] w-full flex-shrink-0">
                    <ListQuickAddIssueForm
                      prePopulatedData={prePopulateQuickAddData(group_by, _list.id)}
                      quickAddCallback={quickAddCallback}
                      viewId={viewId}
                    />
                  </div>
                )}
              </div>
            )
        )}
    </div>
  );
};

export interface IList {
  issueIds: IGroupedIssues | TUnGroupedIssues | any;
  issuesMap: IIssueMap;
  group_by: string | null;
  handleIssues: (issue: IIssue, action: EIssueActions) => Promise<void>;
  quickActions: (issue: IIssue) => React.ReactNode;
  displayProperties: IIssueDisplayProperties | undefined;
  showEmptyGroup: boolean;
  enableIssueQuickAdd: boolean;
  canEditProperties: (projectId: string | undefined) => boolean;
  quickAddCallback?: (
    workspaceSlug: string,
    projectId: string,
    data: IIssue,
    viewId?: string
  ) => Promise<IIssue | undefined>;
  viewId?: string;
  disableIssueCreation?: boolean;
  currentStore: EProjectStore;
  addIssuesToView?: (issueIds: string[]) => Promise<IIssue>;
}

export const List: React.FC<IList> = (props) => {
  const {
    issueIds,
    issuesMap,
    group_by,
    handleIssues,
    quickActions,
    quickAddCallback,
    viewId,
    displayProperties,
    showEmptyGroup,
    enableIssueQuickAdd,
    canEditProperties,
    disableIssueCreation,
    currentStore,
    addIssuesToView,
  } = props;

  return (
    <div className="relative h-full w-full">
      <GroupByList
        issueIds={issueIds as TUnGroupedIssues}
        issuesMap={issuesMap}
        group_by={group_by}
        handleIssues={handleIssues}
        quickActions={quickActions}
        displayProperties={displayProperties}
        enableIssueQuickAdd={enableIssueQuickAdd}
        showEmptyGroup={showEmptyGroup}
        canEditProperties={canEditProperties}
        quickAddCallback={quickAddCallback}
        viewId={viewId}
        disableIssueCreation={disableIssueCreation}
        currentStore={currentStore}
        addIssuesToView={addIssuesToView}
      />
    </div>
  );
};
