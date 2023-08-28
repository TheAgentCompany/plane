// mobx
import { action, observable, runInAction, makeAutoObservable } from "mobx";

// services
import issueService from "services/issues.service";

// types
import type { ICurrentUserResponse, IIssue } from "types";

class IssuesStore {
  issues: { [key: string]: IIssue } = {};
  isIssuesLoading: boolean = false;
  rootStore: any | null = null;

  constructor(_rootStore: any | null = null) {
    makeAutoObservable(this, {
      issues: observable.ref,
      loadIssues: action,
      getIssueById: action,
      isIssuesLoading: observable,
      createIssue: action,
      updateIssue: action,
      deleteIssue: action,
    });

    this.rootStore = _rootStore;
  }

  /**
   * @description Fetch all issues of a project and hydrate issues field
   */

  loadIssues = async (workspaceSlug: string, projectId: string) => {
    this.isIssuesLoading = true;
    try {
      const issuesResponse: IIssue[] = (await issueService.getIssuesWithParams(
        workspaceSlug,
        projectId
      )) as IIssue[];

      const issues: { [kye: string]: IIssue } = {};
      issuesResponse.forEach((issue) => {
        issues[issue.id] = issue;
      });

      runInAction(() => {
        this.issues = issues;
        this.isIssuesLoading = false;
      });
    } catch (error) {
      this.isIssuesLoading = false;
      console.error("Fetching issues error", error);
    }
  };

  getIssueById = async (
    workspaceSlug: string,
    projectId: string,
    issueId: string
  ): Promise<IIssue> => {
    if (this.issues[issueId]) return this.issues[issueId];

    try {
      const issueResponse: IIssue = await issueService.retrieve(workspaceSlug, projectId, issueId);

      const issues = {
        ...this.issues,
        [issueResponse.id]: { ...issueResponse },
      };

      runInAction(() => {
        this.issues = issues;
      });

      return issueResponse;
    } catch (error) {
      throw error;
    }
  };

  /**
   * For provided query, this function returns all issues that contain query in their name from the issues store.
   * @param query - query string
   * @returns {IIssue[]} array of issues that contain query in their name
   * @example
   * getFilteredIssues("issue") // [{ id: "", name: "issue", description: "", parent: null }]
   */
  // getFilteredIssues = (query: string): IIssue[] =>
  //   this.issues.filter((i) => i.name.includes(query));

  createIssue = async (
    workspaceSlug: string,
    projectId: string,
    issueForm: IIssue,
    user: ICurrentUserResponse
  ): Promise<IIssue> => {
    try {
      const issueResponse = await issueService.createIssues(
        workspaceSlug,
        projectId,
        issueForm,
        user
      );

      const issues = {
        ...this.issues,
        [issueResponse.id]: { ...issueResponse },
      };

      runInAction(() => {
        this.issues = issues;
      });
      return issueResponse;
    } catch (error) {
      console.error("Creating issue error", error);
      throw error;
    }
  };

  updateIssue = async (
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    issueForm: Partial<IIssue>,
    user: ICurrentUserResponse
  ) => {
    // immediately update the issue in the store
    const issues = { ...this.issues };
    issues[issueId] = { ...this.issues[issueId], ...issueForm };

    runInAction(() => {
      this.issues = issues;
    });

    try {
      // make a patch request to update the issue
      const issueResponse: IIssue = await issueService.patchIssue(
        workspaceSlug,
        projectId,
        issueId,
        issueForm,
        user
      );

      const updatedIssues = { ...this.issues };
      updatedIssues[issueId] = { ...issueResponse };

      runInAction(() => {
        this.issues = updatedIssues;
      });
    } catch (error) {
      return error;
    }
  };

  deleteIssue = async (
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    user: ICurrentUserResponse
  ) => {
    try {
      issueService.deleteIssue(workspaceSlug, projectId, issueId, user);

      const issues = { ...this.issues };
      delete issues[issueId];

      runInAction(() => {
        this.issues = issues;
      });
    } catch (error) {
      console.error("Deleting issue error", error);
    }
  };
}

export default IssuesStore;
