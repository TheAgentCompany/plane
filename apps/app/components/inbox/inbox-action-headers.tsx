import { useEffect, useState } from "react";

// react-datepicker
import DatePicker from "react-datepicker";
// headless ui
import { Popover } from "@headlessui/react";
// components
import { PrimaryButton, SecondaryButton, MultiLevelDropdown } from "components/ui";
// icons
import { InboxIcon, StackedLayersHorizontalIcon } from "components/icons";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
// types
import type { IInboxIssue } from "types";
import { useProjectMyMembership } from "contexts/project-member.context";

type Props = {
  issueCount: number;
  currentIssueIndex: number;
  filter: any;
  setFilter: (value: any) => void;
  inboxIssue?: IInboxIssue;
  onAccept: () => void;
  onDecline: () => void;
  onMarkAsDuplicate: () => void;
  onSnooze: (date: Date | string) => void;
};

export const InboxActionHeader: React.FC<Props> = (props) => {
  const {
    issueCount,
    currentIssueIndex,
    onAccept,
    onDecline,
    onMarkAsDuplicate,
    onSnooze,
    filter,
    setFilter,
    inboxIssue,
  } = props;

  const [date, setDate] = useState(new Date());

  const { memberRole } = useProjectMyMembership();

  useEffect(() => {
    if (!inboxIssue?.issue_inbox.snoozed_till) return;

    setDate(new Date(inboxIssue.issue_inbox.snoozed_till));
  }, [inboxIssue]);

  const isAllowed = memberRole.isMember || memberRole.isOwner;

  return (
    <div className="grid grid-cols-4 border-b border-brand-base divide-x divide-brand-base">
      <div className="col-span-1 flex justify-between p-4">
        <div className="flex items-center gap-2">
          <InboxIcon className="h-4 w-4 text-brand-secondary" />
          <h3 className="font-medium">Inbox</h3>
        </div>
        <div>
          <MultiLevelDropdown
            label="Filters"
            onSelect={(value) => {
              setFilter({
                status: value,
              });
            }}
            direction="left"
            options={[
              {
                id: "all",
                label: "All",
                value: null,
                selected: filter === null,
              },
              {
                id: "snooze",
                label: "Snooze",
                value: 0,
                selected: filter === 0,
              },
              {
                id: "mark_as_duplicate",
                label: "Duplicate",
                value: 2,
                selected: filter === 2,
              },
              {
                id: "accepted",
                label: "Accepted",
                value: 1,
                selected: filter === 1,
              },
              {
                id: "declined",
                label: "Declined",
                value: -1,
                selected: filter === -1,
              },
            ]}
          />
        </div>
      </div>

      <div className="flex justify-between items-center px-4 col-span-3">
        <div className="flex items-center gap-x-2">
          <button
            type="button"
            className="rounded border border-brand-base bg-brand-surface-1 p-1.5 hover:bg-brand-surface-2"
            onClick={() => {
              const e = new KeyboardEvent("keydown", { key: "ArrowUp" });
              document.dispatchEvent(e);
            }}
          >
            <ChevronUpIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="rounded border border-brand-base bg-brand-surface-1 p-1.5 hover:bg-brand-surface-2"
            onClick={() => {
              const e = new KeyboardEvent("keydown", { key: "ArrowDown" });
              document.dispatchEvent(e);
            }}
          >
            <ChevronDownIcon className="h-3.5 w-3.5" />
          </button>
          <div className="text-sm">
            {currentIssueIndex + 1}/{issueCount}
          </div>
        </div>
        {isAllowed && (
          <div className="flex gap-x-3">
            <Popover className="relative">
              <Popover.Button as="div">
                <SecondaryButton className="flex gap-x-1 items-center" size="sm">
                  <ClockIcon className="h-4 w-4 text-brand-secondary" />
                  <span>Snooze</span>
                </SecondaryButton>
              </Popover.Button>
              <Popover.Panel className="w-80 p-2 absolute right-0 z-10 mt-2 mr-3 rounded-md border border-brand-base bg-brand-surface-2 shadow-lg">
                {({ close }) => (
                  <div className="w-full h-full flex flex-col gap-y-1">
                    <DatePicker
                      selected={date ? new Date(date) : null}
                      onChange={(val) => {
                        if (!val) return;
                        setDate(val);
                      }}
                      dateFormat="dd-MM-yyyy"
                      inline
                    />
                    <PrimaryButton
                      className="ml-auto"
                      onClick={() => {
                        close();
                        onSnooze(date);
                      }}
                    >
                      Snooze
                    </PrimaryButton>
                  </div>
                )}
              </Popover.Panel>
            </Popover>
            <SecondaryButton
              size="sm"
              className="flex gap-2 items-center"
              onClick={onMarkAsDuplicate}
            >
              <StackedLayersHorizontalIcon className="h-4 w-4 text-brand-secondary" />
              <span>Mark as duplicate</span>
            </SecondaryButton>
            <SecondaryButton size="sm" className="flex gap-2 items-center" onClick={onAccept}>
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span>Accept</span>
            </SecondaryButton>
            <SecondaryButton size="sm" className="flex gap-2 items-center" onClick={onDecline}>
              <XCircleIcon className="h-4 w-4 text-red-500" />
              <span>Decline</span>
            </SecondaryButton>
          </div>
        )}
      </div>
    </div>
  );
};
