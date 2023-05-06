import React, { useState } from "react";

import { Draggable } from "react-beautiful-dnd";
// component
import StrictModeDroppable from "components/dnd/StrictModeDroppable";
import { SingleCalendarIssue } from "./single-issue";
// icons
import { PlusIcon } from "components/icons";
// helper
import { formatDate } from "helpers/calendar.helper";
// types
import { IIssue } from "types";

type Props = {
  index: number;
  date: {
    date: string;
    issues: IIssue[];
  };
  addIssueToDate: (date: string) => void;
  isMonthlyView: boolean;
  showWeekEnds: boolean;
  isNotAllowed: boolean;
};

export const SingleCalendarDate: React.FC<Props> = ({
  date,
  index,
  addIssueToDate,
  isMonthlyView,
  showWeekEnds,
  isNotAllowed,
}) => {
  const [showAllIssues, setShowAllIssues] = useState(false);

  const totalIssues = date.issues.length;

  return (
    <StrictModeDroppable droppableId={date.date}>
      {(provided) => (
        <div
          key={index}
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`group relative flex min-h-[150px] flex-col gap-1.5 border-t border-brand-base p-2.5 text-left text-sm font-medium hover:bg-brand-surface-1 ${
            showWeekEnds
              ? (index + 1) % 7 === 0
                ? ""
                : "border-r"
              : (index + 1) % 5 === 0
              ? ""
              : "border-r"
          }`}
        >
          {isMonthlyView && <span>{formatDate(new Date(date.date), "d")}</span>}
          {totalIssues > 0 &&
            date.issues.slice(0, showAllIssues ? totalIssues : 4).map((issue: IIssue, index) => (
              <Draggable key={issue.id} draggableId={issue.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    key={index}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`w-full cursor-pointer truncate rounded border border-brand-base px-1.5 py-1.5 text-xs duration-300 hover:cursor-move hover:bg-brand-surface-2 ${
                      snapshot.isDragging ? "bg-brand-surface-2 shadow-lg" : ""
                    }`}
                  >
                    <SingleCalendarIssue issue={issue} key={issue.id} isNotAllowed={isNotAllowed} />
                  </div>
                )}
              </Draggable>
            ))}
          {totalIssues > 4 && (
            <button
              type="button"
              className="w-min whitespace-nowrap rounded-md border border-brand-base bg-brand-surface-2 px-1.5 py-1 text-xs"
              onClick={() => setShowAllIssues((prevData) => !prevData)}
            >
              {showAllIssues ? "Hide" : totalIssues - 4 + " more"}
            </button>
          )}

          <div
            className={`absolute ${
              isMonthlyView ? "bottom-2" : "top-2"
            } right-2 flex items-center justify-center rounded-md bg-brand-surface-2 p-1 text-xs text-brand-secondary opacity-0 group-hover:opacity-100`}
          >
            <button
              className="flex items-center justify-center gap-1 text-center"
              onClick={() => addIssueToDate(date.date)}
            >
              <PlusIcon className="h-3 w-3 text-brand-secondary" />
              Add issue
            </button>
          </div>

          {provided.placeholder}
        </div>
      )}
    </StrictModeDroppable>
  );
};
