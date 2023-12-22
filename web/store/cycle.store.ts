import { action, computed, observable, makeObservable, runInAction } from "mobx";
import { set, omit } from "lodash";
import { isFuture, isPast } from "date-fns";
// types
import { ICycle, CycleDateCheckData } from "types";
// mobx
import { RootStore } from "store/root.store";
// services
import { ProjectService } from "services/project";
import { IssueService } from "services/issue";
import { CycleService } from "services/cycle.service";

export interface ICycleStore {
  // observables
  cycleMap: Record<string, ICycle>;
  activeCycleMap: Record<string, ICycle>; // TODO: Merge these two into single map
  // computed
  projectCycleIds: string[] | null;
  projectCompletedCycleIds: string[] | null;
  projectUpcomingCycleIds: string[] | null;
  projectIncompleteCycleIds: string[] | null;
  projectDraftCycleIds: string[] | null;
  projectActiveCycleId: string | null;
  // computed actions
  getCycleById: (cycleId: string) => ICycle | null;
  getActiveCycleById: (cycleId: string) => ICycle | null;
  // actions
  validateDate: (workspaceSlug: string, projectId: string, payload: CycleDateCheckData) => Promise<any>;
  // fetch
  fetchAllCycles: (workspaceSlug: string, projectId: string) => Promise<ICycle[]>;
  fetchActiveCycle: (workspaceSlug: string, projectId: string) => Promise<ICycle[]>;
  fetchCycleDetails: (workspaceSlug: string, projectId: string, cycleId: string) => Promise<ICycle>;
  // crud
  createCycle: (workspaceSlug: string, projectId: string, data: Partial<ICycle>) => Promise<ICycle>;
  updateCycleDetails: (
    workspaceSlug: string,
    projectId: string,
    cycleId: string,
    data: Partial<ICycle>
  ) => Promise<ICycle>;
  deleteCycle: (workspaceSlug: string, projectId: string, cycleId: string) => Promise<void>;
  // favorites
  addCycleToFavorites: (workspaceSlug: string, projectId: string, cycleId: string) => Promise<any>;
  removeCycleFromFavorites: (workspaceSlug: string, projectId: string, cycleId: string) => Promise<void>;
}

export class CycleStore implements ICycleStore {
  // observables
  cycleMap: Record<string, ICycle> = {};
  activeCycleMap: Record<string, ICycle> = {};
  // root store
  rootStore;
  // services
  projectService;
  issueService;
  cycleService;

  constructor(_rootStore: RootStore) {
    makeObservable(this, {
      // observables
      cycleMap: observable,
      activeCycleMap: observable,
      // computed
      projectCycleIds: computed,
      projectCompletedCycleIds: computed,
      projectUpcomingCycleIds: computed,
      projectIncompleteCycleIds: computed,
      projectDraftCycleIds: computed,
      projectActiveCycleId: computed,
      // computed actions
      getCycleById: action,
      getActiveCycleById: action,
      // actions
      fetchAllCycles: action,
      fetchActiveCycle: action,
      fetchCycleDetails: action,
      createCycle: action,
      updateCycleDetails: action,
      deleteCycle: action,
      addCycleToFavorites: action,
      removeCycleFromFavorites: action,
    });

    this.rootStore = _rootStore;
    this.projectService = new ProjectService();
    this.issueService = new IssueService();
    this.cycleService = new CycleService();
  }

  // computed
  /**
   * returns all cycle ids for a project
   */
  get projectCycleIds() {
    const projectId = this.rootStore.app.router.projectId;
    if (!projectId) return null;
    const allCycles = Object.keys(this.cycleMap ?? {}).filter(
      (cycleId) => this.cycleMap?.[cycleId]?.project === projectId
    );
    return allCycles || null;
  }

  /**
   * returns all completed cycle ids for a project
   */
  get projectCompletedCycleIds() {
    const allCycles = this.projectCycleIds;
    if (!allCycles) return null;
    const completedCycles = allCycles.filter((cycleId) => {
      const hasEndDatePassed = isPast(new Date(this.cycleMap?.[cycleId]?.end_date ?? ""));
      return hasEndDatePassed;
    });
    return completedCycles || null;
  }

  /**
   * returns all upcoming cycle ids for a project
   */
  get projectUpcomingCycleIds() {
    const allCycles = this.projectCycleIds;
    if (!allCycles) return null;
    const upcomingCycles = allCycles.filter((cycleId) => {
      const isStartDateUpcoming = isFuture(new Date(this.cycleMap?.[cycleId]?.start_date ?? ""));
      return isStartDateUpcoming;
    });
    return upcomingCycles || null;
  }

  /**
   * returns all incomplete cycle ids for a project
   */
  get projectIncompleteCycleIds() {
    const allCycles = this.projectCycleIds;
    if (!allCycles) return null;
    const incompleteCycles = allCycles.filter((cycleId) => {
      const hasEndDatePassed = isPast(new Date(this.cycleMap?.[cycleId]?.end_date ?? ""));
      return !hasEndDatePassed;
    });
    return incompleteCycles || null;
  }

  /**
   * returns all draft cycle ids for a project
   */
  get projectDraftCycleIds() {
    const allCycles = this.projectCycleIds;
    if (!allCycles) return null;
    const draftCycles = allCycles.filter((cycleId) => {
      const cycleDetails = this.cycleMap?.[cycleId];
      return !cycleDetails?.start_date && !cycleDetails?.end_date;
    });
    return draftCycles || null;
  }

  /**
   * returns active cycle id for a project
   */
  get projectActiveCycleId() {
    const projectId = this.rootStore.app.router.projectId;
    if (!projectId) return null;
    const activeCycle = Object.keys(this.activeCycleMap ?? {}).find(
      (cycleId) => this.activeCycleMap?.[cycleId]?.project === projectId
    );
    return activeCycle || null;
  }

  /**
   * @description returns cycle details by cycle id
   * @param cycleId
   * @returns
   */
  getCycleById = (cycleId: string): ICycle | null => this.cycleMap?.[cycleId] ?? null;

  /**
   * @description returns active cycle details by cycle id
   * @param cycleId
   * @returns
   */
  getActiveCycleById = (cycleId: string): ICycle | null => this.activeCycleMap?.[cycleId] ?? null;

  /**
   * @description validates cycle dates
   * @param workspaceSlug
   * @param projectId
   * @param payload
   * @returns
   */
  validateDate = async (workspaceSlug: string, projectId: string, payload: CycleDateCheckData) =>
    await this.cycleService.cycleDateCheck(workspaceSlug, projectId, payload);

  /**
   * @description fetches all cycles for a project
   * @param workspaceSlug
   * @param projectId
   * @returns
   */
  fetchAllCycles = async (workspaceSlug: string, projectId: string) =>
    await this.cycleService.getCyclesWithParams(workspaceSlug, projectId).then((response) => {
      runInAction(() => {
        response.forEach((cycle) => {
          set(this.cycleMap, [cycle.id], cycle);
        });
      });
      return response;
    });

  /**
   * @description fetches active cycle for a project
   * @param workspaceSlug
   * @param projectId
   * @returns
   */
  fetchActiveCycle = async (workspaceSlug: string, projectId: string) =>
    await this.cycleService.getCyclesWithParams(workspaceSlug, projectId, "current").then((response) => {
      runInAction(() => {
        response.forEach((cycle) => {
          set(this.activeCycleMap, [cycle.id], cycle);
        });
      });
      return response;
    });

  /**
   * @description fetches cycle details
   * @param workspaceSlug
   * @param projectId
   * @param cycleId
   * @returns
   */
  fetchCycleDetails = async (workspaceSlug: string, projectId: string, cycleId: string) =>
    await this.cycleService.getCycleDetails(workspaceSlug, projectId, cycleId).then((response) => {
      runInAction(() => {
        set(this.cycleMap, [response.id], { ...this.cycleMap?.[response.id], ...response });
        set(this.activeCycleMap, [response.id], { ...this.activeCycleMap?.[response.id], ...response });
      });
      return response;
    });

  /**
   * @description creates a new cycle
   * @param workspaceSlug
   * @param projectId
   * @param data
   * @returns
   */
  createCycle = async (workspaceSlug: string, projectId: string, data: Partial<ICycle>) =>
    await this.cycleService.createCycle(workspaceSlug, projectId, data).then((response) => {
      runInAction(() => {
        set(this.cycleMap, [response.id], response);
        set(this.activeCycleMap, [response.id], response);
      });
      return response;
    });

  /**
   * @description updates cycle details
   * @param workspaceSlug
   * @param projectId
   * @param cycleId
   * @param data
   * @returns
   */
  updateCycleDetails = async (workspaceSlug: string, projectId: string, cycleId: string, data: Partial<ICycle>) => {
    try {
      runInAction(() => {
        set(this.cycleMap, [cycleId], { ...this.cycleMap?.[cycleId], ...data });
        set(this.activeCycleMap, [cycleId], { ...this.activeCycleMap?.[cycleId], ...data });
      });
      const response = await this.cycleService.patchCycle(workspaceSlug, projectId, cycleId, data);
      return response;
    } catch (error) {
      console.log("Failed to patch cycle from cycle store");
      this.fetchAllCycles(workspaceSlug, projectId);
      this.fetchActiveCycle(workspaceSlug, projectId);
      throw error;
    }
  };

  /**
   * @description deletes a cycle
   * @param workspaceSlug
   * @param projectId
   * @param cycleId
   */
  deleteCycle = async (workspaceSlug: string, projectId: string, cycleId: string) =>
    await this.cycleService.deleteCycle(workspaceSlug, projectId, cycleId).then(() => {
      runInAction(() => {
        omit(this.cycleMap, [cycleId]);
        omit(this.activeCycleMap, [cycleId]);
      });
    });

  /**
   * @description adds a cycle to favorites
   * @param workspaceSlug
   * @param projectId
   * @param cycleId
   * @returns
   */
  addCycleToFavorites = async (workspaceSlug: string, projectId: string, cycleId: string) => {
    const currentCycle = this.getCycleById(cycleId);
    const currentActiveCycle = this.getActiveCycleById(cycleId);
    try {
      runInAction(() => {
        if (currentCycle) set(this.cycleMap, [cycleId, "is_favorite"], true);
        if (currentActiveCycle) set(this.activeCycleMap, [cycleId, "is_favorite"], true);
      });
      // updating through api.
      const response = await this.cycleService.addCycleToFavorites(workspaceSlug, projectId, { cycle: cycleId });
      return response;
    } catch (error) {
      runInAction(() => {
        if (currentCycle) set(this.cycleMap, [cycleId, "is_favorite"], false);
        if (currentActiveCycle) set(this.activeCycleMap, [cycleId, "is_favorite"], false);
      });
      throw error;
    }
  };

  /**
   * @description removes a cycle from favorites
   * @param workspaceSlug
   * @param projectId
   * @param cycleId
   * @returns
   */
  removeCycleFromFavorites = async (workspaceSlug: string, projectId: string, cycleId: string) => {
    const currentCycle = this.getCycleById(cycleId);
    const currentActiveCycle = this.getActiveCycleById(cycleId);
    try {
      runInAction(() => {
        if (currentCycle) set(this.cycleMap, [cycleId, "is_favorite"], false);
        if (currentActiveCycle) set(this.activeCycleMap, [cycleId, "is_favorite"], false);
      });
      const response = await this.cycleService.removeCycleFromFavorites(workspaceSlug, projectId, cycleId);
      return response;
    } catch (error) {
      runInAction(() => {
        if (currentCycle) set(this.cycleMap, [cycleId, "is_favorite"], true);
        if (currentActiveCycle) set(this.activeCycleMap, [cycleId, "is_favorite"], true);
      });
      throw error;
    }
  };
}
