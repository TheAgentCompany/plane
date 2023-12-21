import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
// hooks
import { useIssues, useUser } from "hooks/store";
// components
import { ProjectIssueQuickActions } from "components/issues";
// types
import { IIssue } from "types";
// constants
import { EIssueActions } from "../../types";
import { BaseKanBanRoot } from "../base-kanban-root";
import { EProjectStore } from "store/application/command-palette.store";
import { EUserProjectRoles } from "constants/project";
import { EIssuesStoreType } from "constants/issue";
import { useMemo } from "react";

export const ProfileIssuesKanBanLayout: React.FC = observer(() => {
  const router = useRouter();
  const { workspaceSlug, userId } = router.query as { workspaceSlug: string; userId: string };

  const { issues, issuesFilter } = useIssues(EIssuesStoreType.PROFILE);

  const {
    membership: { currentWorkspaceAllProjectsRole },
  } = useUser();

  const issueActions = useMemo(
    () => ({
      [EIssueActions.UPDATE]: async (issue: IIssue) => {
        if (!workspaceSlug || !userId) return;

        await issues.updateIssue(workspaceSlug, userId, issue.id, issue);
      },
      [EIssueActions.DELETE]: async (issue: IIssue) => {
        if (!workspaceSlug || !userId) return;

        await issues.removeIssue(workspaceSlug, issue.project, issue.id, userId);
      },
    }),
    [issues, workspaceSlug, userId]
  );

  const canEditPropertiesBasedOnProject = (projectId: string) => {
    const currentProjectRole = currentWorkspaceAllProjectsRole && currentWorkspaceAllProjectsRole[projectId];

    return !!currentProjectRole && currentProjectRole >= EUserProjectRoles.MEMBER;
  };

  return (
    <BaseKanBanRoot
      issueActions={issueActions}
      issuesFilter={issuesFilter}
      issues={issues}
      showLoader={true}
      QuickActions={ProjectIssueQuickActions}
      currentStore={EProjectStore.PROFILE}
      canEditPropertiesBasedOnProject={canEditPropertiesBasedOnProject}
    />
  );
});
