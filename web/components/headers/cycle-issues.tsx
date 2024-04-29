import { useCallback, useState } from "react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useRouter } from "next/router";
// hooks
// components
import { ArrowRight, Plus, PanelRight } from "lucide-react";
import { IIssueDisplayFilterOptions, IIssueDisplayProperties, IIssueFilterOptions, TIssueLayouts } from "@plane/types";
import { Breadcrumbs, Button, ContrastIcon, CustomMenu, Tooltip } from "@plane/ui";
import { ProjectAnalyticsModal } from "@/components/analytics";
import { BreadcrumbLink } from "@/components/common";
import { DisplayFiltersSelection, FiltersDropdown, FilterSelection, LayoutSelection } from "@/components/issues";
import { ProjectLogo } from "@/components/project";
// constants
import {
  DP_APPLIED,
  DP_REMOVED,
  E_CYCLE_ISSUES,
  elementFromPath,
  FILTER_APPLIED,
  FILTER_REMOVED,
  FILTER_SEARCHED,
  LAYOUT_CHANGED,
  LP_UPDATED,
} from "@/constants/event-tracker";
import { EIssueFilterType, EIssuesStoreType, ISSUE_DISPLAY_FILTERS_BY_LAYOUT } from "@/constants/issue";
import { EUserProjectRoles } from "@/constants/project";
import { cn } from "@/helpers/common.helper";
import { truncateText } from "@/helpers/string.helper";
import {
  useApplication,
  useEventTracker,
  useCycle,
  useLabel,
  useMember,
  useProject,
  useProjectState,
  useUser,
  useIssues,
} from "@/hooks/store";
import useLocalStorage from "@/hooks/use-local-storage";
// ui
// icons
// helpers
// types
import { usePlatformOS } from "@/hooks/use-platform-os";

const CycleDropdownOption: React.FC<{ cycleId: string }> = ({ cycleId }) => {
  // router
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;
  // store hooks
  const { getCycleById } = useCycle();
  // derived values
  const cycle = getCycleById(cycleId);
  //

  if (!cycle) return null;

  return (
    <CustomMenu.MenuItem key={cycle.id}>
      <Link href={`/${workspaceSlug}/projects/${projectId}/cycles/${cycle.id}`} className="flex items-center gap-1.5">
        <ContrastIcon className="h-3 w-3" />
        {truncateText(cycle.name, 40)}
      </Link>
    </CustomMenu.MenuItem>
  );
};

export const CycleIssuesHeader: React.FC = observer(() => {
  // states
  const [analyticsModal, setAnalyticsModal] = useState(false);
  // router
  const router = useRouter();
  const { workspaceSlug, projectId, cycleId } = router.query as {
    workspaceSlug: string;
    projectId: string;
    cycleId: string;
  };
  // store hooks
  const {
    issuesFilter: { issueFilters, updateFilters },
  } = useIssues(EIssuesStoreType.CYCLE);
  const { currentProjectCycleIds, getCycleById } = useCycle();
  const {
    commandPalette: { toggleCreateIssueModal },
  } = useApplication();
  const { setTrackElement, captureEvent, captureIssuesFilterEvent, captureIssuesDisplayFilterEvent } =
    useEventTracker();
  const {
    membership: { currentProjectRole },
  } = useUser();
  const { currentProjectDetails } = useProject();
  const { projectStates } = useProjectState();
  const { projectLabels } = useLabel();
  const {
    project: { projectMemberIds },
  } = useMember();
  const { isMobile } = usePlatformOS();

  const activeLayout = issueFilters?.displayFilters?.layout;

  const { setValue, storedValue } = useLocalStorage("cycle_sidebar_collapsed", "false");

  const isSidebarCollapsed = storedValue ? (storedValue === "true" ? true : false) : false;
  const toggleSidebar = () => {
    setValue(`${!isSidebarCollapsed}`);
  };

  const handleLayoutChange = useCallback(
    (layout: TIssueLayouts) => {
      if (!workspaceSlug || !projectId) return;
      updateFilters(workspaceSlug, projectId, EIssueFilterType.DISPLAY_FILTERS, { layout: layout }, cycleId).then(() =>
        captureEvent(LAYOUT_CHANGED, {
          layout: layout,
          ...elementFromPath(router.asPath),
        })
      );
    },
    [workspaceSlug, projectId, cycleId, updateFilters, captureEvent, router.asPath]
  );

  const handleFiltersUpdate = useCallback(
    (key: keyof IIssueFilterOptions, value: string | string[]) => {
      if (!workspaceSlug || !projectId) return;
      const newValues = issueFilters?.filters?.[key] ?? [];

      if (Array.isArray(value)) {
        // this validation is majorly for the filter start_date, target_date custom
        value.forEach((val) => {
          if (!newValues.includes(val)) newValues.push(val);
          else newValues.splice(newValues.indexOf(val), 1);
        });
      } else {
        if (issueFilters?.filters?.[key]?.includes(value)) newValues.splice(newValues.indexOf(value), 1);
        else newValues.push(value);
      }

      updateFilters(workspaceSlug, projectId, EIssueFilterType.FILTERS, { [key]: newValues }, cycleId).then(() =>
        captureIssuesFilterEvent({
          eventName: (issueFilters?.filters?.[key] ?? []).length > newValues.length ? FILTER_REMOVED : FILTER_APPLIED,
          payload: {
            routePath: router.asPath,
            filters: issueFilters,
            filter_property: value,
            filter_type: key,
          },
        })
      );
    },
    [workspaceSlug, projectId, cycleId, issueFilters, updateFilters, captureIssuesFilterEvent, router.asPath]
  );

  const handleDisplayFilters = useCallback(
    (updatedDisplayFilter: Partial<IIssueDisplayFilterOptions>) => {
      if (!workspaceSlug || !projectId) return;
      updateFilters(workspaceSlug, projectId, EIssueFilterType.DISPLAY_FILTERS, updatedDisplayFilter, cycleId).then(
        () =>
          captureIssuesDisplayFilterEvent({
            eventName: LP_UPDATED,
            payload: {
              property_type: Object.keys(updatedDisplayFilter).join(","),
              property: Object.values(updatedDisplayFilter)?.[0],
              routePath: router.asPath,
              filters: issueFilters,
            },
          })
      );
    },
    [workspaceSlug, projectId, cycleId, updateFilters, issueFilters, captureIssuesDisplayFilterEvent, router.asPath]
  );

  const handleDisplayProperties = useCallback(
    (property: Partial<IIssueDisplayProperties>) => {
      if (!workspaceSlug || !projectId) return;
      updateFilters(workspaceSlug, projectId, EIssueFilterType.DISPLAY_PROPERTIES, property, cycleId).then(() =>
        captureIssuesDisplayFilterEvent({
          eventName: Object.values(property)?.[0] === true ? DP_APPLIED : DP_REMOVED,
          payload: {
            display_property: Object.keys(property).join(","),
            routePath: router.asPath,
            filters: issueFilters,
          },
        })
      );
    },
    [workspaceSlug, projectId, cycleId, updateFilters, issueFilters, captureIssuesDisplayFilterEvent, router.asPath]
  );

  // derived values
  const cycleDetails = cycleId ? getCycleById(cycleId.toString()) : undefined;
  const isCompletedCycle = cycleDetails?.status?.toLocaleLowerCase() === "completed";
  const canUserCreateIssue =
    currentProjectRole && [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER].includes(currentProjectRole);

  const issueCount = cycleDetails
    ? issueFilters?.displayFilters?.sub_issue && cycleDetails?.sub_issues
      ? cycleDetails.total_issues + cycleDetails?.sub_issues
      : cycleDetails.total_issues
    : undefined;

  return (
    <>
      <ProjectAnalyticsModal
        isOpen={analyticsModal}
        onClose={() => setAnalyticsModal(false)}
        cycleDetails={cycleDetails ?? undefined}
      />
      <div className="relative z-[15] w-full items-center gap-x-2 gap-y-4">
        <div className="flex justify-between bg-custom-sidebar-background-100 p-4">
          <div className="flex items-center gap-2">
            <Breadcrumbs onBack={router.back}>
              <Breadcrumbs.BreadcrumbItem
                type="text"
                link={
                  <span>
                    <span className="hidden md:block">
                      <BreadcrumbLink
                        label={currentProjectDetails?.name ?? "Project"}
                        href={`/${workspaceSlug}/projects/${currentProjectDetails?.id}/issues`}
                        icon={
                          currentProjectDetails && (
                            <span className="grid place-items-center flex-shrink-0 h-4 w-4">
                              <ProjectLogo logo={currentProjectDetails?.logo_props} className="text-sm" />
                            </span>
                          )
                        }
                      />
                    </span>
                    <Link
                      href={`/${workspaceSlug}/projects/${currentProjectDetails?.id}/issues`}
                      className="block md:hidden pl-2 text-custom-text-300"
                    >
                      ...
                    </Link>
                  </span>
                }
              />
              <Breadcrumbs.BreadcrumbItem
                type="text"
                link={
                  <BreadcrumbLink
                    label="Cycles"
                    href={`/${workspaceSlug}/projects/${projectId}/cycles`}
                    icon={<ContrastIcon className="h-4 w-4 text-custom-text-300" />}
                  />
                }
              />
              <Breadcrumbs.BreadcrumbItem
                type="component"
                component={
                  <CustomMenu
                    label={
                      <>
                        <ContrastIcon className="h-3 w-3" />
                        <div className="flex items-center gap-2 w-auto max-w-[70px] sm:max-w-[200px] truncate">
                          <p className="truncate">{cycleDetails?.name && cycleDetails.name}</p>
                          {issueCount && issueCount > 0 ? (
                            <Tooltip
                              isMobile={isMobile}
                              tooltipContent={`There are ${issueCount} ${
                                issueCount > 1 ? "issues" : "issue"
                              } in this cycle`}
                              position="bottom"
                            >
                              <span className="cursor-default flex items-center text-center justify-center px-2 flex-shrink-0 bg-custom-primary-100/20 text-custom-primary-100 text-xs font-semibold rounded-xl">
                                {issueCount}
                              </span>
                            </Tooltip>
                          ) : null}
                        </div>
                      </>
                    }
                    className="ml-1.5 flex-shrink-0 truncate"
                    placement="bottom-start"
                  >
                    {currentProjectCycleIds?.map((cycleId) => <CycleDropdownOption key={cycleId} cycleId={cycleId} />)}
                  </CustomMenu>
                }
              />
            </Breadcrumbs>
          </div>
          <div className="hidden md:flex items-center gap-2 ">
            <LayoutSelection
              layouts={["list", "kanban", "calendar", "spreadsheet", "gantt_chart"]}
              onChange={(layout) => handleLayoutChange(layout)}
              selectedLayout={activeLayout}
            />
            <FiltersDropdown title="Filters" placement="bottom-end">
              <FilterSelection
                filters={issueFilters?.filters ?? {}}
                handleFiltersUpdate={handleFiltersUpdate}
                layoutDisplayFiltersOptions={
                  activeLayout ? ISSUE_DISPLAY_FILTERS_BY_LAYOUT.issues[activeLayout] : undefined
                }
                labels={projectLabels}
                memberIds={projectMemberIds ?? undefined}
                states={projectStates}
                onSearchCapture={() =>
                  captureIssuesFilterEvent({
                    eventName: FILTER_SEARCHED,
                    payload: {
                      routePath: router.asPath,
                      current_filters: issueFilters?.filters,
                      layout: issueFilters?.displayFilters?.layout,
                    },
                  })
                }
                cycleViewDisabled={!currentProjectDetails?.cycle_view}
                moduleViewDisabled={!currentProjectDetails?.module_view}
              />
            </FiltersDropdown>
            <FiltersDropdown title="Display" placement="bottom-end">
              <DisplayFiltersSelection
                layoutDisplayFiltersOptions={
                  activeLayout ? ISSUE_DISPLAY_FILTERS_BY_LAYOUT.issues[activeLayout] : undefined
                }
                displayFilters={issueFilters?.displayFilters ?? {}}
                handleDisplayFiltersUpdate={handleDisplayFilters}
                displayProperties={issueFilters?.displayProperties ?? {}}
                handleDisplayPropertiesUpdate={handleDisplayProperties}
                ignoreGroupedFilters={["cycle"]}
                cycleViewDisabled={!currentProjectDetails?.cycle_view}
                moduleViewDisabled={!currentProjectDetails?.module_view}
              />
            </FiltersDropdown>

            {canUserCreateIssue && (
              <>
                <Button onClick={() => setAnalyticsModal(true)} variant="neutral-primary" size="sm">
                  Analytics
                </Button>
                {!isCompletedCycle && (
                  <Button
                    onClick={() => {
                      setTrackElement(E_CYCLE_ISSUES);
                      toggleCreateIssueModal(true, EIssuesStoreType.CYCLE);
                    }}
                    size="sm"
                    prependIcon={<Plus />}
                  >
                    Add Issue
                  </Button>
                )}
              </>
            )}
            <button
              type="button"
              className="grid h-7 w-7 place-items-center rounded p-1 outline-none hover:bg-custom-sidebar-background-80"
              onClick={toggleSidebar}
            >
              <ArrowRight className={`h-4 w-4 duration-300 ${isSidebarCollapsed ? "-rotate-180" : ""}`} />
            </button>
          </div>
          <button
            type="button"
            className="grid md:hidden h-7 w-7 place-items-center rounded p-1 outline-none hover:bg-custom-sidebar-background-80"
            onClick={toggleSidebar}
          >
            <PanelRight className={cn("w-4 h-4", !isSidebarCollapsed ? "text-[#3E63DD]" : "text-custom-text-200")} />
          </button>
        </div>
      </div>
    </>
  );
});
