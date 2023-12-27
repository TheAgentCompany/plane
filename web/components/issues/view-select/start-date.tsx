// ui
import { CustomDatePicker } from "components/ui";
import { Tooltip } from "@plane/ui";
import { CalendarClock } from "lucide-react";
// helpers
import { renderShortDate, renderShortDateWithYearFormat, renderShortMonthDate } from "helpers/date-time.helper";
// types
import { TIssue } from "types";

type Props = {
  issue: TIssue;
  onChange: (date: string | null) => void;
  handleOnOpen?: () => void;
  handleOnClose?: () => void;
  tooltipPosition?: "top" | "bottom";
  className?: string;
  noBorder?: boolean;
  disabled: boolean;
};

export const ViewStartDateSelect: React.FC<Props> = ({
  issue,
  onChange,
  handleOnOpen,
  handleOnClose,
  tooltipPosition = "top",
  className = "",
  noBorder = false,
  disabled,
}) => {
  const maxDate = issue.target_date ? new Date(issue.target_date) : null;
  maxDate?.setDate(maxDate.getDate());
  const today = new Date();
  const startDate = new Date(issue.start_date ?? "");
  const areYearsEqual = startDate.getFullYear() === today.getFullYear();

  return (
    <Tooltip
      tooltipHeading="Start date"
      tooltipContent={issue.start_date ? renderShortDateWithYearFormat(issue.start_date) ?? "N/A" : "N/A"}
      position={tooltipPosition}
    >
      <div className={`group max-w-[6.5rem] flex-shrink-0 ${className}`}>
        <CustomDatePicker
          value={issue?.start_date}
          onChange={onChange}
          maxDate={maxDate ?? undefined}
          noBorder={noBorder}
          handleOnOpen={handleOnOpen}
          customInput={
            <div
              className={`flex cursor-pointer items-center justify-center gap-2 rounded border border-custom-border-200 px-2 py-1 text-xs shadow-sm duration-200 hover:bg-custom-background-80 ${
                issue?.start_date ? "pr-6 text-custom-text-300" : "text-custom-text-400"
              }`}
            >
              {issue?.start_date ? (
                <>
                  <CalendarClock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    {areYearsEqual
                      ? renderShortDate(issue?.start_date, "_ _")
                      : renderShortMonthDate(issue?.start_date, "_ _")}
                  </span>
                </>
              ) : (
                <>
                  <CalendarClock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Start Date</span>
                </>
              )}
            </div>
          }
          handleOnClose={handleOnClose}
          disabled={disabled}
        />
      </div>
    </Tooltip>
  );
};
