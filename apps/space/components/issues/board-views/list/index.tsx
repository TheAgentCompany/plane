"use client";

// mobx react lite
import { observer } from "mobx-react-lite";
// components
import { IssueListHeader } from "components/issues/board-views/list/header";
import { IssueListBlock } from "components/issues/board-views/list/block";
// interfaces
import { IIssueState, IIssue } from "store/types/issue";
// mobx hook
import { useMobxStore } from "lib/mobx/store-provider";
import { RootStore } from "store/root";

export const IssueListView = observer(() => {
  const store: RootStore = useMobxStore();

  return (
    <>
      {store?.issue?.states &&
        store?.issue?.states.length > 0 &&
        store?.issue?.states.map((_state: IIssueState) => (
          <div key={_state.id} className="relative w-full">
            <IssueListHeader state={_state} />
            {store.issue.getFilteredIssuesByState(_state.id) &&
            store.issue.getFilteredIssuesByState(_state.id).length > 0 ? (
              <div className="divide-y">
                {store.issue.getFilteredIssuesByState(_state.id).map((_issue: IIssue) => (
                  <IssueListBlock key={_issue.id} issue={_issue} />
                ))}
              </div>
            ) : (
              <div className="px-9 py-3.5 text-sm text-custom-text-200 bg-custom-background-100">
                No Issues are available.
              </div>
            )}
          </div>
        ))}
    </>
  );
});
