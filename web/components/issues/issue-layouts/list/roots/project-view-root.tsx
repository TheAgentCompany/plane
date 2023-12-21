import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
// store
import { useIssues } from "hooks/store";
// constants
import { useRouter } from "next/router";
import { EIssueActions } from "../../types";
import { IIssue } from "types";
// components
import { BaseListRoot } from "../base-list-root";
import { ProjectIssueQuickActions } from "../../quick-action-dropdowns";
import { EProjectStore } from "store/application/command-palette.store";
import { EIssuesStoreType } from "constants/issue";

export interface IViewListLayout {}

export const ProjectViewListLayout: React.FC = observer(() => {
  // store
  const { issuesFilter, issues } = useIssues(EIssuesStoreType.PROJECT_VIEW);

  const router = useRouter();
  const { workspaceSlug, projectId } = router.query as { workspaceSlug: string; projectId: string };

  if (!workspaceSlug || !projectId) return null;

  const issueActions = useMemo(
    () => ({
      [EIssueActions.UPDATE]: async (issue: IIssue) => {
        if (!workspaceSlug || !projectId) return;

        await issues.updateIssue(workspaceSlug, projectId, issue.id, issue);
      },
      [EIssueActions.DELETE]: async (issue: IIssue) => {
        if (!workspaceSlug || !projectId) return;

        await issues.removeIssue(workspaceSlug, projectId, issue.id);
      },
    }),
    [issues, workspaceSlug, projectId]
  );

  return (
    <BaseListRoot
      issuesFilter={issuesFilter}
      issues={issues}
      QuickActions={ProjectIssueQuickActions}
      issueActions={issueActions}
      currentStore={EProjectStore.PROJECT_VIEW}
    />
  );
});
