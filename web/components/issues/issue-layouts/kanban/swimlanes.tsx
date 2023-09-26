import React from "react";
// components
import { KanBanGroupByHeaderRoot } from "./headers/group-by-root";
import { KanBanSubGroupByHeaderRoot } from "./headers/sub-group-by-root";
import { KanBan } from "./default";
// constants
import { ISSUE_STATE_GROUPS, ISSUE_PRIORITIES } from "constants/issue";
// mobx
import { observer } from "mobx-react-lite";
// mobx
import { useMobxStore } from "lib/mobx/store-provider";
import { RootStore } from "store/root";

export interface IKanBanSwimLanes {
  issues?: any;
  handleIssues?: () => void;
  handleDragDrop?: () => void;
}

const SubGroupSwimlaneHeader = ({ list, _key }: any) => (
  <div className="relative w-full min-h-full h-max flex items-center">
    {list &&
      list.length > 0 &&
      list.map((_list: any) => (
        <div className="flex-shrink-0 flex flex-col w-[340px]">
          <KanBanGroupByHeaderRoot column_id={_list?.[_key]} />
        </div>
      ))}
  </div>
);

const SubGroupSwimlane = ({ issues, list, _key }: any) => (
  <div className="relative w-full min-h-full h-max">
    {list &&
      list.length > 0 &&
      list.map((_list: any) => (
        <div className="flex-shrink-0 flex flex-col">
          <div className="sticky top-[30px] w-full z-[1] bg-custom-background-90 flex items-center py-1">
            <div className="flex-shrink-0 sticky left-0 bg-custom-background-90 pr-2">
              <KanBanSubGroupByHeaderRoot column_id={_list?.[_key]} />
            </div>
            <div className="w-full border-b border-custom-border-400 border-dashed" />
          </div>

          <div className="relative">
            <KanBan issues={issues} sub_group_id={_list?.[_key]} />
          </div>
        </div>
      ))}
  </div>
);

export const KanBanSwimLanes: React.FC<IKanBanSwimLanes> = observer(({ issues }) => {
  const { project: projectStore, issueFilter: issueFilterStore }: RootStore = useMobxStore();

  const group_by: string | null = issueFilterStore?.userDisplayFilters?.group_by || null;
  const sub_group_by: string | null = issueFilterStore?.userDisplayFilters?.sub_group_by || null;

  console.log("sub_group_by", sub_group_by);

  return (
    <div className="relative">
      <div className="sticky top-0 z-[2] bg-custom-background-90 h-[30px]">
        {group_by && group_by === "state" && <SubGroupSwimlaneHeader list={projectStore?.projectStates} _key={"id"} />}
        {group_by && group_by === "state_detail.group" && (
          <SubGroupSwimlaneHeader list={ISSUE_STATE_GROUPS} _key={"key"} />
        )}
        {group_by && group_by === "priority" && <SubGroupSwimlaneHeader list={ISSUE_PRIORITIES} _key={"key"} />}
        {group_by && group_by === "labels" && <SubGroupSwimlaneHeader list={projectStore?.projectLabels} _key={"id"} />}
        {group_by && group_by === "assignees" && (
          <SubGroupSwimlaneHeader list={projectStore?.projectMembers} _key={"id"} />
        )}
        {group_by && group_by === "created_by" && (
          <SubGroupSwimlaneHeader list={projectStore?.projectMembers} _key={"id"} />
        )}
      </div>

      {sub_group_by && sub_group_by === "state" && (
        <SubGroupSwimlane issues={issues} list={projectStore?.projectStates} _key={"id"} />
      )}

      {sub_group_by && sub_group_by === "state_detail.group" && (
        <SubGroupSwimlane issues={issues} list={ISSUE_STATE_GROUPS} _key={"key"} />
      )}

      {sub_group_by && sub_group_by === "priority" && (
        <SubGroupSwimlane issues={issues} list={ISSUE_PRIORITIES} _key={"key"} />
      )}

      {sub_group_by && sub_group_by === "labels" && (
        <SubGroupSwimlane issues={issues} list={projectStore?.projectLabels} _key={"id"} />
      )}

      {sub_group_by && sub_group_by === "assignees" && (
        <SubGroupSwimlane issues={issues} list={projectStore?.projectMembers} _key={"id"} />
      )}

      {sub_group_by && sub_group_by === "created_by" && (
        <SubGroupSwimlane issues={issues} list={projectStore?.projectMembers} _key={"id"} />
      )}
    </div>
  );
});
