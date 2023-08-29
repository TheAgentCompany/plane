export type TIssueBoardKeys = "list" | "kanban" | "calendar" | "spreadsheet" | "gantt";

export interface IIssueBoardViews {
  key: TIssueBoardKeys;
  title: string;
  icon: string;
  className: string;
}

export type TIssuePriorityKey = "urgent" | "high" | "medium" | "low" | "none";
export type TIssuePriorityTitle = "Urgent" | "High" | "Medium" | "Low" | "None";
export interface IIssuePriorityFilters {
  key: TIssuePriorityKey;
  title: TIssuePriorityTitle;
  className: string;
  icon: string;
}

export type TIssueGroupKey = "backlog" | "unstarted" | "started" | "completed" | "cancelled";
export type TIssueGroupTitle = "Backlog" | "Unstarted" | "Started" | "Completed" | "Cancelled";

export interface IIssueGroup {
  key: TIssueGroupKey;
  title: TIssueGroupTitle;
  color: string;
  className: string;
  icon: React.FC;
}

export interface IIssue {
  id: string;
  sequence_id: number;
  name: string;
  description_html: string;
  project: string;
  project_detail: any;
  priority: TIssuePriorityKey | null;
  state: string;
  state_detail: any;
  label_details: any;
  target_date: any;
  start_date: any;
}

export interface IIssueState {
  id: string;
  name: string;
  group: TIssueGroupKey;
  color: string;
}

export interface IIssueLabel {
  id: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  actor_detail: ActorDetail;
  issue_detail: IssueDetail;
  project_detail: ProjectDetail;
  workspace_detail: WorkspaceDetail;
  comment_reactions: any[];
  is_member: boolean;
  created_at: Date;
  updated_at: Date;
  comment_stripped: string;
  comment_json: any;
  comment_html: string;
  attachments: any[];
  access: string;
  created_by: string;
  updated_by: string;
  project: string;
  workspace: string;
  issue: string;
  actor: string;
}

export interface ActorDetail {
  id: string;
  first_name: string;
  last_name: string;
  avatar: string;
  is_bot: boolean;
  display_name: string;
}

export interface IssueDetail {
  id: string;
  name: string;
  description: Description;
  description_html: string;
  priority: string;
  start_date: null;
  target_date: null;
  sequence_id: number;
  sort_order: number;
}

export interface Description {
  type: string;
  content: DescriptionContent[];
}

export interface DescriptionContent {
  type: string;
  attrs?: Attrs;
  content: ContentContent[];
}

export interface Attrs {
  level: number;
}

export interface ContentContent {
  text: string;
  type: string;
}

export interface ProjectDetail {
  id: string;
  identifier: string;
  name: string;
  cover_image: string;
  icon_prop: null;
  emoji: string;
  description: string;
}

export interface WorkspaceDetail {
  name: string;
  slug: string;
  id: string;
}

export interface IssueDetailType {
  [issueId: string]: {
    issue: IIssue;
    comments: Comment[];
    reactions: any[];
    votes: any[];
  };
}

export interface IIssueStore {
  currentIssueBoardView: TIssueBoardKeys | null;
  loader: boolean;
  error: any | null;

  states: IIssueState[] | null;
  labels: IIssueLabel[] | null;
  issues: IIssue[] | null;

  issue_detail: IssueDetailType;

  userSelectedStates: string[];
  userSelectedLabels: string[];
  userSelectedPriorities: string[];

  getCountOfIssuesByState: (state: string) => number;
  getFilteredIssuesByState: (state: string) => IIssue[];

  getUserSelectedFilter: (key: "state" | "priority" | "label", value: string) => boolean;

  checkIfFilterExistsForKey: (key: "state" | "priority" | "label") => boolean;

  clearUserSelectedFilter: (key: "state" | "priority" | "label" | "all") => void;

  getIfFiltersIsEmpty: () => boolean;

  getURLDefinition: (
    workspaceSlug: string,
    projectId: string,
    action?: {
      key: "state" | "priority" | "label" | "all";
      value?: string;
      removeAll?: boolean;
    }
  ) => string;

  setCurrentIssueBoardView: (view: TIssueBoardKeys) => void;
  getIssuesAsync: (workspaceSlug: string, projectId: string, params: any) => Promise<void>;

  getIssueByIdAsync: (workspaceSlug: string, projectId: string, issueId: string) => Promise<IssueDetailType>;
}
