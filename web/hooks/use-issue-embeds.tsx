import { PROJECT_ISSUES_LIST, STATES_LIST } from "constants/fetch-keys";
import { StoreContext } from "contexts/store-context";
import { toJS } from "mobx";
import { useContext } from "react";
import { IssueService } from "services/issue";
import useSWR from "swr";
import { useProject, useProjectState } from "./store";

const issueService = new IssueService();

export const useIssueEmbeds = () => {
  const workspaceSlug = useContext(StoreContext).app.router.workspaceSlug;
  const projectId = useContext(StoreContext).app.router.projectId;

  const { getProjectById, fetchProjects } = useProject();
  const { getStateById, fetchProjectStates } = useProjectState();

  const { data: issuesResponse, isLoading: issuesLoading } = useSWR(
    workspaceSlug && projectId ? PROJECT_ISSUES_LIST(workspaceSlug as string, projectId as string) : null,
    workspaceSlug && projectId ? () => issueService.getIssues(workspaceSlug as string, projectId as string) : null
  );

  const { isLoading: projectsLoading } = useSWR(
    workspaceSlug ? `WORKSPACE_PROJECTS_${workspaceSlug}` : null,
    workspaceSlug ? () => fetchProjects(workspaceSlug as string) : null
  );

  const { isLoading: statesLoading } = useSWR(
    workspaceSlug && projectId ? STATES_LIST(projectId.toString()) : null,
    workspaceSlug && projectId ? () => fetchProjectStates(workspaceSlug.toString(), projectId.toString()) : null
  );

  const issues = Object.values(issuesResponse ?? {});
  const issuesWithStateAndProject = issues.map((issue) => ({
    ...issue,
    state_detail: toJS(getStateById(issue.state_id)),
    project_detail: toJS(getProjectById(issue.project_id)),
  }));

  return {
    issues: issuesWithStateAndProject,
    isLoading: issuesLoading || projectsLoading || statesLoading,
  };
};
