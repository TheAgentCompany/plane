import { TIssue, TIssuesResponse } from "@plane/types";
import { API_BASE_URL } from "@/helpers/common.helper";
import { APIService } from "../api.service";

export class WorkspaceDraftService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async getIssues(workspaceSlug: string, query?: any, config = {}): Promise<TIssuesResponse> {
    return this.get(
      `/api/workspaces/${workspaceSlug}/draft-issues/`,
      {
        params: { ...query },
      },
      config
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getIssueById(workspaceSlug: string, issueId: string, queries?: any): Promise<TIssue> {
    return this.get(`/api/workspaces/${workspaceSlug}/draft-issues/${issueId}/`, {
      params: queries,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async createIssue(workspaceSlug: string, data: any): Promise<TIssue> {
    return this.post(`/api/workspaces/${workspaceSlug}/draft-issues/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async updateIssue(workspaceSlug: string, issueId: string, data: any): Promise<void> {
    return this.patch(`/api/workspaces/${workspaceSlug}/draft-issues/${issueId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async deleteIssue(workspaceSlug: string, issueId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/draft-issues/${issueId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async moveToIssues(workspaceSlug: string, issueId: string, data: Partial<TIssue>): Promise<void> {
    return this.post(`/api/workspaces/${workspaceSlug}/draft-to-issue/${issueId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }
}
