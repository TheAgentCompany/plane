// mobx
import { observer } from "mobx-react-lite";
// components
import { StateHeader } from "./state";
import { StateGroupHeader } from "./state-group";
import { AssigneesHeader } from "./assignee";
import { PriorityHeader } from "./priority";
import { LabelHeader } from "./label";
import { CreatedByHeader } from "./created_by";

export interface IKanBanSubGroupByHeaderRoot {
  column_id: string;
  sub_group_by: string | null;
  group_by: string | null;
}

export const KanBanSubGroupByHeaderRoot: React.FC<IKanBanSubGroupByHeaderRoot> = observer(
  ({ column_id, sub_group_by, group_by }) => (
    <>
      {sub_group_by && sub_group_by === "state" && (
        <StateHeader
          column_id={column_id}
          sub_group_by={sub_group_by}
          group_by={group_by}
          header_type={`sub_group_by`}
        />
      )}
      {sub_group_by && sub_group_by === "state_detail.group" && (
        <StateGroupHeader
          column_id={column_id}
          sub_group_by={sub_group_by}
          group_by={group_by}
          header_type={`sub_group_by`}
        />
      )}
      {sub_group_by && sub_group_by === "priority" && (
        <PriorityHeader
          column_id={column_id}
          sub_group_by={sub_group_by}
          group_by={group_by}
          header_type={`sub_group_by`}
        />
      )}
      {sub_group_by && sub_group_by === "labels" && (
        <LabelHeader
          column_id={column_id}
          sub_group_by={sub_group_by}
          group_by={group_by}
          header_type={`sub_group_by`}
        />
      )}
      {sub_group_by && sub_group_by === "assignees" && (
        <AssigneesHeader
          column_id={column_id}
          sub_group_by={sub_group_by}
          group_by={group_by}
          header_type={`sub_group_by`}
        />
      )}
      {sub_group_by && sub_group_by === "created_by" && (
        <CreatedByHeader
          column_id={column_id}
          sub_group_by={sub_group_by}
          group_by={group_by}
          header_type={`sub_group_by`}
        />
      )}
    </>
  )
);
