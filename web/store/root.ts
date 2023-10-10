// mobx lite
import { enableStaticRendering } from "mobx-react-lite";
// store imports
import UserStore from "./user";
import ThemeStore from "./theme";
import ProjectPublishStore, { IProjectPublishStore } from "./project_publish";
import IssueStore, { IIssueStore } from "./issue";
import DraftIssuesStore from "./issue_draft";
import WorkspaceStore, { IWorkspaceStore } from "./workspace";
import ProjectStore, { IProjectStore } from "./project";
import ModuleStore, { IModuleStore } from "./modules";
import ModuleIssueStore, { IModuleIssueStore } from "./module_issue";
import ModuleFilterStore, { IModuleFilterStore } from "./module_filters";
import ModuleIssueKanBanViewStore, { IModuleIssueKanBanViewStore } from "./module_issue_kanban_view";
import CycleStore, { ICycleStore } from "./cycles";
import CycleIssueStore, { ICycleIssueStore } from "./cycle_issue";
import CycleIssueFilterStore, { ICycleIssueFilterStore } from "./cycle_issue_filters";
import CycleIssueKanBanViewStore, { ICycleIssueKanBanViewStore } from "./cycle_issue_kanban_view";
import ViewStore, { IViewStore } from "./views";
import IssueFilterStore, { IIssueFilterStore } from "./issue_filters";
import IssueViewDetailStore from "./issue_detail";
import IssueKanBanViewStore from "./kanban_view";
import CalendarStore, { ICalendarStore } from "./calendar";
import GlobalViewsStore, { IGlobalViewsStore } from "./global_views";
import GlobalViewIssuesStore, { IGlobalViewIssuesStore } from "./global_view_issues";
import WorkspaceFilterStore, { IWorkspaceFilterStore } from "./workspace_filters";

enableStaticRendering(typeof window === "undefined");

export class RootStore {
  user;
  theme;

  workspace: IWorkspaceStore;
  workspaceFilter: IWorkspaceFilterStore;

  projectPublish: IProjectPublishStore;
  project: IProjectStore;
  issue: IIssueStore;

  module: IModuleStore;
  moduleIssue: IModuleIssueStore;
  moduleFilter: IModuleFilterStore;
  moduleIssueKanBanView: IModuleIssueKanBanViewStore;

  cycle: ICycleStore;
  cycleIssue: ICycleIssueStore;
  cycleIssueFilter: ICycleIssueFilterStore;
  cycleIssueKanBanView: ICycleIssueKanBanViewStore;

  view: IViewStore;
  issueFilter: IIssueFilterStore;
  issueDetail: IssueViewDetailStore;
  issueKanBanView: IssueKanBanViewStore;
  draftIssuesStore: DraftIssuesStore;

  calendar: ICalendarStore;

  globalViews: IGlobalViewsStore;
  globalViewIssues: IGlobalViewIssuesStore;

  constructor() {
    this.user = new UserStore(this);
    this.theme = new ThemeStore(this);

    this.workspace = new WorkspaceStore(this);
    this.workspaceFilter = new WorkspaceFilterStore(this);

    this.project = new ProjectStore(this);
    this.projectPublish = new ProjectPublishStore(this);

    this.module = new ModuleStore(this);
    this.moduleIssue = new ModuleIssueStore(this);
    this.moduleFilter = new ModuleFilterStore(this);
    this.moduleIssueKanBanView = new ModuleIssueKanBanViewStore(this);

    this.cycle = new CycleStore(this);
    this.cycleIssue = new CycleIssueStore(this);
    this.cycleIssueFilter = new CycleIssueFilterStore(this);
    this.cycleIssueKanBanView = new CycleIssueKanBanViewStore(this);

    this.view = new ViewStore(this);
    this.issue = new IssueStore(this);
    this.issueFilter = new IssueFilterStore(this);
    this.issueDetail = new IssueViewDetailStore(this);
    this.issueKanBanView = new IssueKanBanViewStore(this);
    this.draftIssuesStore = new DraftIssuesStore(this);

    this.calendar = new CalendarStore(this);

    this.globalViews = new GlobalViewsStore(this);
    this.globalViewIssues = new GlobalViewIssuesStore(this);
  }
}
