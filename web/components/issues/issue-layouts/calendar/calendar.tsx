import { useState } from "react";
import { observer } from "mobx-react-lite";
// hooks
import useSize from "hooks/use-window-size";
// components
// ui
import { Spinner } from "@plane/ui";
import {
  CalendarHeader,
  CalendarIssueBlock,
  CalendarQuickAddIssueForm,
  CalendarWeekDays,
  CalendarWeekHeader,
} from "components/issues";
// types
import {
  IIssueDisplayFilterOptions,
  IIssueDisplayProperties,
  IIssueFilterOptions,
  TGroupedIssues,
  TIssue,
  TIssueKanbanFilters,
  TIssueMap,
} from "@plane/types";
import { ICalendarWeek } from "./types";
// helpers
import { renderFormattedPayloadDate } from "helpers/date-time.helper";
import { cn } from "helpers/common.helper";
// constants
import { EIssueFilterType, EIssuesStoreType } from "constants/issue";
import { EUserProjectRoles } from "constants/project";
import { useIssues, useUser } from "hooks/store";
import { useCalendarView } from "hooks/store/use-calendar-view";
import { ICycleIssuesFilter } from "store/issue/cycle";
import { IModuleIssuesFilter } from "store/issue/module";
import { IProjectIssuesFilter } from "store/issue/project";
import { IProjectViewIssuesFilter } from "store/issue/project-views";
import { MONTHS_LIST } from "constants/calendar";

type Props = {
  issuesFilterStore: IProjectIssuesFilter | IModuleIssuesFilter | ICycleIssuesFilter | IProjectViewIssuesFilter;
  issues: TIssueMap | undefined;
  groupedIssueIds: TGroupedIssues;
  layout: "month" | "week" | undefined;
  showWeekends: boolean;
  quickActions: (issue: TIssue, customActionButton?: React.ReactElement) => React.ReactNode;
  quickAddCallback?: (
    workspaceSlug: string,
    projectId: string,
    data: TIssue,
    viewId?: string
  ) => Promise<TIssue | undefined>;
  addIssuesToView?: (issueIds: string[]) => Promise<any>;
  viewId?: string;
  readOnly?: boolean;
  updateFilters?: (
    projectId: string,
    filterType: EIssueFilterType,
    filters: IIssueFilterOptions | IIssueDisplayFilterOptions | IIssueDisplayProperties | TIssueKanbanFilters
  ) => Promise<void>;
};

export const CalendarChart: React.FC<Props> = observer((props) => {
  const {
    issuesFilterStore,
    issues,
    groupedIssueIds,
    layout,
    showWeekends,
    quickActions,
    quickAddCallback,
    addIssuesToView,
    viewId,
    updateFilters,
    readOnly = false,
  } = props;
  // states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // store hooks
  const {
    issues: { viewFlags },
  } = useIssues(EIssuesStoreType.PROJECT);
  const issueCalendarView = useCalendarView();
  const {
    membership: { currentProjectRole },
  } = useUser();
  const [windowWidth] = useSize();

  const { enableIssueCreation } = viewFlags || {};
  const isEditingAllowed = !!currentProjectRole && currentProjectRole >= EUserProjectRoles.MEMBER;

  const calendarPayload = issueCalendarView.calendarPayload;

  const allWeeksOfActiveMonth = issueCalendarView.allWeeksOfActiveMonth;

  const formattedDatePayload = renderFormattedPayloadDate(selectedDate) ?? undefined;

  if (!calendarPayload || !formattedDatePayload)
    return (
      <div className="grid h-full w-full place-items-center">
        <Spinner />
      </div>
    );

  const issueIdList = groupedIssueIds ? groupedIssueIds[formattedDatePayload] : null;

  return (
    <>
      <div className="flex h-full w-full flex-col overflow-hidden">
        <CalendarHeader
          setSelectedDate={setSelectedDate}
          issuesFilterStore={issuesFilterStore}
          updateFilters={updateFilters}
        />
        <div
          className={cn("flex md:h-full w-full flex-col", {
            "vertical-scrollbar scrollbar-lg": windowWidth > 768,
            "overflow-y-auto": windowWidth <= 768,
          })}
        >
          <CalendarWeekHeader isLoading={!issues} showWeekends={showWeekends} />
          <div className="h-full w-full">
            {layout === "month" && (
              <div className="grid h-full w-full grid-cols-1 divide-y-[0.5px] divide-custom-border-200">
                {allWeeksOfActiveMonth &&
                  Object.values(allWeeksOfActiveMonth).map((week: ICalendarWeek, weekIndex) => (
                    <CalendarWeekDays
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      issuesFilterStore={issuesFilterStore}
                      key={weekIndex}
                      week={week}
                      issues={issues}
                      groupedIssueIds={groupedIssueIds}
                      enableQuickIssueCreate
                      disableIssueCreation={!enableIssueCreation || !isEditingAllowed}
                      quickActions={quickActions}
                      quickAddCallback={quickAddCallback}
                      addIssuesToView={addIssuesToView}
                      viewId={viewId}
                      readOnly={readOnly}
                    />
                  ))}
              </div>
            )}
            {layout === "week" && (
              <CalendarWeekDays
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                issuesFilterStore={issuesFilterStore}
                week={issueCalendarView.allDaysOfActiveWeek}
                issues={issues}
                groupedIssueIds={groupedIssueIds}
                enableQuickIssueCreate
                disableIssueCreation={!enableIssueCreation || !isEditingAllowed}
                quickActions={quickActions}
                quickAddCallback={quickAddCallback}
                addIssuesToView={addIssuesToView}
                viewId={viewId}
                readOnly={readOnly}
              />
            )}
          </div>

          {/* mobile view */}
          <>
            <div className="md:hidden">
              <p className="p-4 text-xl font-semibold">
                {`${selectedDate.getDate()} ${
                  MONTHS_LIST[selectedDate.getMonth() + 1].title
                }, ${selectedDate.getFullYear()}`}
              </p>
              {issueIdList &&
                issueIdList?.length > 0 &&
                issueIdList?.map((issueId) => {
                  if (!issues?.[issueId]) return null;
                  const issue = issues?.[issueId];
                  return (
                    <div className="border-b border-custom-border-200 px-4">
                      <CalendarIssueBlock issue={issue} quickActions={quickActions} />
                    </div>
                  );
                })}
            </div>
            {enableIssueCreation && isEditingAllowed && !readOnly && (
              <div className="flex-shrink-0 px-2 border-b border-custom-border-200 !h-10 flex items-center md:hidden">
                <CalendarQuickAddIssueForm
                  formKey="target_date"
                  groupId={formattedDatePayload}
                  prePopulatedData={{
                    target_date: renderFormattedPayloadDate(selectedDate) ?? undefined,
                  }}
                  quickAddCallback={quickAddCallback}
                  addIssuesToView={addIssuesToView}
                  viewId={viewId}
                />
              </div>
            )}
          </>
        </div>
      </div>
    </>
  );
});
