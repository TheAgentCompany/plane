import { makeObservable, observable, runInAction, action, computed } from "mobx";
import { set } from "lodash";
// services
import { PageService } from "services/page.service";
// store
import { PageStore, IPageStore } from "store/page.store";
// types
import { IPage, IRecentPages } from "@plane/types";
import { RootStore } from "./root.store";
import { isThisWeek, isToday, isYesterday } from "date-fns";

export interface IProjectPageStore {
  projectPageMap: Record<string, Record<string, IPageStore>>;
  projectArchivedPageMap: Record<string, Record<string, IPageStore>>;

  projectPageIds: string[] | undefined;
  favoriteProjectPageIds: string[] | undefined;
  privateProjectPageIds: string[] | undefined;
  publicProjectPageIds: string[] | undefined;
  recentProjectPageIds: IRecentPages | undefined;
  // fetch actions
  fetchProjectPages: (workspaceSlug: string, projectId: string) => void;
  fetchArchivedProjectPages: (workspaceSlug: string, projectId: string) => void;
  // crud actions
  createPage: (workspaceSlug: string, projectId: string, data: Partial<IPage>) => Promise<IPage>;
  deletePage: (workspaceSlug: string, projectId: string, pageId: string) => void;
  archivePage: (workspaceSlug: string, projectId: string, pageId: string) => void;
  restorePage: (workspaceSlug: string, projectId: string, pageId: string) => void;
}

export class ProjectPageStore implements IProjectPageStore {
  projectPageMap: Record<string, Record<string, IPageStore>> = {}; // { projectId: [page1, page2] }
  projectArchivedPageMap: Record<string, Record<string, IPageStore>> = {}; // { projectId: [page1, page2] }

  // root store
  rootStore;

  pageService;
  constructor(_rootStore: RootStore) {
    makeObservable(this, {
      projectPageMap: observable,
      projectArchivedPageMap: observable,

      projectPageIds: computed,
      favoriteProjectPageIds: computed,
      privateProjectPageIds: computed,
      publicProjectPageIds: computed,
      recentProjectPageIds: computed,

      // fetch actions
      fetchProjectPages: action,
      fetchArchivedProjectPages: action,
      // crud actions
      createPage: action,
      deletePage: action,
    });
    this.rootStore = _rootStore;

    this.pageService = new PageService();
  }

  get projectPageIds() {
    const projectId = this.rootStore.app.router.projectId;

    if (!projectId || !this.projectPageMap?.[projectId]) return [];
    return Object.keys(this.projectPageMap[projectId]);
  }

  get favoriteProjectPageIds() {
    const projectId = this.rootStore.app.router.projectId;
    if (!this.projectPageIds || !projectId) return [];

    const favouritePages: string[] = this.projectPageIds.filter(
      (page) => this.projectPageMap[projectId][page].is_favorite
    );
    return favouritePages;
  }

  get privateProjectPageIds() {
    const projectId = this.rootStore.app.router.projectId;
    if (!this.projectPageIds || !projectId) return [];

    const privatePages: string[] = this.projectPageIds.filter(
      (page) => this.projectPageMap[projectId][page].access === 1
    );
    return privatePages;
  }

  get publicProjectPageIds() {
    const projectId = this.rootStore.app.router.projectId;
    if (!this.projectPageIds || !projectId) return [];

    const publicPages: string[] = this.projectPageIds.filter(
      (page) => this.projectPageMap[projectId][page].access === 0
    );
    return publicPages;
  }

  get recentProjectPageIds() {
    const projectId = this.rootStore.app.router.projectId;
    if (!this.projectPageIds || !projectId) return;

    const today: string[] = this.projectPageIds.filter((page) =>
      isToday(new Date(this.projectPageMap[projectId][page].updated_at))
    );

    const yesterday: string[] = this.projectPageIds.filter((page) =>
      isYesterday(new Date(this.projectPageMap[projectId][page].updated_at))
    );

    const this_week: string[] = this.projectPageIds.filter((page) => {
      const pageUpdatedAt = this.projectPageMap[projectId][page].updated_at;
      return (
        isThisWeek(new Date(pageUpdatedAt)) &&
        !isToday(new Date(pageUpdatedAt)) &&
        !isYesterday(new Date(pageUpdatedAt))
      );
    });

    const older: string[] = this.projectPageIds.filter((page) => {
      const pageUpdatedAt = this.projectPageMap[projectId][page].updated_at;
      return !isThisWeek(new Date(pageUpdatedAt)) && !isYesterday(new Date(pageUpdatedAt));
    });

    return { today, yesterday, this_week, older };
  }

  // get favoriteProjectPages() {
  //   const projectId = this.rootStore.app.router.projectId;
  //   if (!this.projectPageIds || !projectId) return [];
  //
  //   const favouritePages: IPageStore[] = this.projectPageIds
  //     .map((pageId) => this.projectPageMap[projectId][pageId])
  //     .filter((page) => page.is_favorite);
  //   return favouritePages;
  // }

  // get privateProjectPages() {
  //   const projectId = this.rootStore.app.router.projectId;
  //   if (!this.projectPageIds || !projectId) return [];
  //
  //   const privatePages: IPageStore[] = this.projectPageIds
  //     .map((pageId) => this.projectPageMap[projectId][pageId])
  //     .filter((page) => page.access === 1);
  //   return privatePages;
  // }

  // get publicProjectPages() {
  //   const projectId = this.rootStore.app.router.projectId;
  //   if (!this.projectPageIds || !projectId) return [];
  //
  //   const publicPages: IPageStore[] = this.projectPageIds
  //     .map((pageId) => this.projectPageMap[projectId][pageId])
  //     .filter((page) => page.access === 1);
  //   return publicPages;
  // }

  // get recentProjectPages() {
  //   const projectId = this.rootStore.app.router.projectId;
  //   if (!this.projectPageIds || !projectId) return;
  //
  //   const today: IPageStore[] = this.projectPageIds
  //     .map((pageId) => this.projectPageMap[projectId][pageId])
  //     .filter((page) => isToday(new Date(page.updated_at)));
  //
  //   const yesterday: IPageStore[] = this.projectPageIds
  //     .map((pageId) => this.projectPageMap[projectId][pageId])
  //     .filter((page) => isYesterday(new Date(page.updated_at)));
  //
  //   const this_week: IPageStore[] = this.projectPageIds
  //     .map((pageId) => this.projectPageMap[projectId][pageId])
  //     .filter((page) => {
  //       const pageUpdatedAt = page.updated_at;
  //       return (
  //         isThisWeek(new Date(pageUpdatedAt)) &&
  //         !isToday(new Date(pageUpdatedAt)) &&
  //         !isYesterday(new Date(pageUpdatedAt))
  //       );
  //     });
  //
  //   const older: IPageStore[] = this.projectPageIds
  //     .map((pageId) => this.projectPageMap[projectId][pageId])
  //     .filter((page) => {
  //       const pageUpdatedAt = page.updated_at;
  //       return !isThisWeek(new Date(pageUpdatedAt)) && !isYesterday(new Date(pageUpdatedAt));
  //     });
  //
  //   return { today, yesterday, this_week, older };
  // }

  /**
   * Fetching all the pages for a specific project
   * @param workspaceSlug
   * @param projectId
   */
  fetchProjectPages = async (workspaceSlug: string, projectId: string) => {
    try {
      const response = await this.pageService.getProjectPages(workspaceSlug, projectId);
      runInAction(() => {
        for (const page of response) {
          set(this.projectPageMap, [projectId, page.id], new PageStore(page));
        }
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * fetches all archived pages for a project.
   * @param workspaceSlug
   * @param projectId
   * @returns Promise<IPage[]>
   */
  fetchArchivedProjectPages = async (workspaceSlug: string, projectId: string) =>
    await this.pageService.getArchivedPages(workspaceSlug, projectId).then((response) => {
      runInAction(() => {
        for (const page of response) {
          set(this.projectArchivedPageMap, [projectId, page.id], new PageStore(page));
        }
      });
      return response;
    });

  /**
   * Creates a new page using the api and updated the local state in store
   * @param workspaceSlug
   * @param projectId
   * @param data
   */
  createPage = async (workspaceSlug: string, projectId: string, data: Partial<IPage>) => {
    const response = await this.pageService.createPage(workspaceSlug, projectId, data);
    runInAction(() => {
      set(this.projectPageMap, [projectId, response.id], new PageStore(response));
    });
    return response;
  };

  /**
   * delete a page using the api and updates the local state in store
   * @param workspaceSlug
   * @param projectId
   * @param pageId
   * @returns
   */
  deletePage = async (workspaceSlug: string, projectId: string, pageId: string) => {
    const response = await this.pageService.deletePage(workspaceSlug, projectId, pageId);
    runInAction(() => {
      delete this.projectPageMap[projectId][pageId];
    });
    return response;
  };

  /**
   * Mark a page archived
   * @param workspaceSlug
   * @param projectId
   * @param pageId
   */
  archivePage = async (workspaceSlug: string, projectId: string, pageId: string) => {
    const response = await this.pageService.archivePage(workspaceSlug, projectId, pageId);
    runInAction(() => {
      set(this.projectArchivedPageMap, [projectId, pageId], this.projectPageMap[projectId][pageId]);
      delete this.projectPageMap[projectId][pageId];
    });
    return response;
  };

  /**
   * Restore a page from archived pages to pages
   * @param workspaceSlug
   * @param projectId
   * @param pageId
   */
  restorePage = async (workspaceSlug: string, projectId: string, pageId: string) =>
    await this.pageService.restorePage(workspaceSlug, projectId, pageId).then(() => {
      runInAction(() => {
        set(this.projectPageMap, [projectId, pageId], this.projectArchivedPageMap[projectId][pageId]);
        delete this.projectArchivedPageMap[projectId][pageId];
      });
    });
}
