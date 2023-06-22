import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import { mutate } from "swr";

// react-datepicker
import DatePicker from "react-datepicker";
// headless ui
import { Popover } from "@headlessui/react";
// contexts
import { useProjectMyMembership } from "contexts/project-member.context";
// services
import inboxServices from "services/inbox.service";
// hooks
import useInboxView from "hooks/use-inbox-view";
import useUserAuth from "hooks/use-user-auth";
import useToast from "hooks/use-toast";
// components
import {
  DeclineIssueModal,
  DeleteIssueModal,
  FiltersDropdown,
  SelectDuplicateInboxIssueModal,
} from "components/inbox";
// ui
import { PrimaryButton, SecondaryButton } from "components/ui";
// icons
import { InboxIcon, StackedLayersHorizontalIcon } from "components/icons";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
// types
import type { IInboxIssueDetail, TInboxStatus } from "types";
// fetch-keys
import { INBOX_ISSUE_DETAILS } from "constants/fetch-keys";

export const InboxActionHeader = () => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [date, setDate] = useState(new Date());
  const [selectDuplicateIssue, setSelectDuplicateIssue] = useState(false);
  const [declineIssueModal, setDeclineIssueModal] = useState(false);
  const [deleteIssueModal, setDeleteIssueModal] = useState(false);

  const router = useRouter();
  const { workspaceSlug, projectId, inboxId, inboxIssueId } = router.query;

  const { user } = useUserAuth();
  const { memberRole } = useProjectMyMembership();
  const {
    filters,
    setFilters,
    filtersLength,
    issues: inboxIssues,
    mutate: mutateInboxIssues,
  } = useInboxView();
  const { setToastAlert } = useToast();

  const markInboxStatus = async (data: TInboxStatus) => {
    if (!workspaceSlug || !projectId || !inboxId || !inboxIssueId) return;

    mutate<IInboxIssueDetail>(
      INBOX_ISSUE_DETAILS(inboxId as string, inboxIssueId as string),
      (prevData) => {
        if (!prevData) return prevData;

        return {
          ...prevData,
          issue_inbox: [{ ...prevData.issue_inbox[0], ...data }],
        };
      },
      false
    );
    mutateInboxIssues(
      (prevData) =>
        (prevData ?? []).map((i) =>
          i.bridge_id === inboxIssueId
            ? { ...i, issue_inbox: [{ ...i.issue_inbox[0], ...data }] }
            : i
        ),
      false
    );

    await inboxServices
      .markInboxStatus(
        workspaceSlug.toString(),
        projectId.toString(),
        inboxId.toString(),
        inboxIssues?.find((inboxIssue) => inboxIssue.bridge_id === inboxIssueId)?.bridge_id!,
        data,
        user
      )
      .catch(() =>
        setToastAlert({
          type: "error",
          title: "Error!",
          message: "Something went wrong while updating inbox status. Please try again.",
        })
      )
      .finally(() => {
        mutate(INBOX_ISSUE_DETAILS(inboxId as string, inboxIssueId as string));
        mutateInboxIssues();
      });
  };

  const handleAcceptIssue = () => {
    setIsAccepting(true);

    markInboxStatus({
      status: 1,
    }).finally(() => setIsAccepting(false));
  };

  const issue = inboxIssues?.find((issue) => issue.bridge_id === inboxIssueId);
  const currentIssueIndex =
    inboxIssues?.findIndex((issue) => issue.bridge_id === inboxIssueId) ?? 0;

  useEffect(() => {
    if (!issue?.issue_inbox[0].snoozed_till) return;

    setDate(new Date(issue.issue_inbox[0].snoozed_till));
  }, [issue]);

  const issueStatus = issue?.issue_inbox[0].status;
  const isAllowed = memberRole.isMember || memberRole.isOwner;

  const today = new Date();
  const tomorrow = new Date(today);

  tomorrow.setDate(today.getDate() + 1);

  return (
    <>
      <SelectDuplicateInboxIssueModal
        isOpen={selectDuplicateIssue}
        onClose={() => setSelectDuplicateIssue(false)}
        value={
          inboxIssues?.find((inboxIssue) => inboxIssue.bridge_id === inboxIssueId)?.issue_inbox[0]
            .duplicate_to
        }
        onSubmit={(dupIssueId: string) => {
          markInboxStatus({
            status: 2,
            duplicate_to: dupIssueId,
          }).finally(() => setSelectDuplicateIssue(false));
        }}
      />
      <DeclineIssueModal
        isOpen={declineIssueModal}
        handleClose={() => setDeclineIssueModal(false)}
        data={inboxIssues?.find((i) => i.bridge_id === inboxIssueId)}
        onSubmit={async () => {
          await markInboxStatus({
            status: -1,
          }).finally(() => setDeclineIssueModal(false));
        }}
      />
      <DeleteIssueModal
        isOpen={deleteIssueModal}
        handleClose={() => setDeleteIssueModal(false)}
        data={inboxIssues?.find((i) => i.bridge_id === inboxIssueId)}
      />
      <div className="grid grid-cols-4 border-b border-brand-base divide-x divide-brand-base">
        <div className="col-span-1 flex justify-between p-4">
          <div className="flex items-center gap-2">
            <InboxIcon className="h-4 w-4 text-brand-secondary" />
            <h3 className="font-medium">Inbox</h3>
          </div>
          <div className="relative">
            <FiltersDropdown
              filters={filters}
              onSelect={(option) => {
                const key = option.key as keyof typeof filters;

                const valueExists = (filters[key] as any[])?.includes(option.value);

                if (valueExists) {
                  setFilters({
                    [option.key]: ((filters[key] ?? []) as any[])?.filter(
                      (val) => val !== option.value
                    ),
                  });
                } else {
                  setFilters({
                    [option.key]: [...((filters[key] ?? []) as any[]), option.value],
                  });
                }
              }}
              direction="right"
              height="rg"
            />
            {filtersLength > 0 && (
              <div className="absolute -top-2 -right-2 h-4 w-4 text-[0.65rem] grid place-items-center rounded-full text-brand-base bg-brand-surface-2 border border-brand-base z-10">
                <span>{filtersLength}</span>
              </div>
            )}
          </div>
        </div>
        {inboxIssueId && (
          <div className="flex justify-between items-center gap-4 px-4 col-span-3">
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
                {currentIssueIndex + 1}/{inboxIssues?.length ?? 0}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {isAllowed && (
                <div
                  className={`flex-shrink-0 ${
                    issueStatus === 0 || issueStatus === -2 ? "" : "opacity-70"
                  }`}
                >
                  <Popover className="relative">
                    <Popover.Button
                      as="button"
                      type="button"
                      disabled={!(issueStatus === 0 || issueStatus === -2)}
                    >
                      <SecondaryButton
                        className={`flex gap-x-1 items-center ${
                          issueStatus === 0 || issueStatus === -2 ? "" : "cursor-not-allowed"
                        }`}
                        size="sm"
                      >
                        <ClockIcon className="h-4 w-4 text-brand-secondary" />
                        <span>Snooze</span>
                      </SecondaryButton>
                    </Popover.Button>
                    <Popover.Panel className="w-80 p-2 absolute right-0 z-10 mt-2 rounded-md border border-brand-base bg-brand-surface-2 shadow-lg">
                      {({ close }) => (
                        <div className="w-full h-full flex flex-col gap-y-1">
                          <DatePicker
                            selected={date ? new Date(date) : null}
                            onChange={(val) => {
                              if (!val) return;
                              setDate(val);
                            }}
                            dateFormat="dd-MM-yyyy"
                            minDate={tomorrow}
                            inline
                          />
                          <PrimaryButton
                            className="ml-auto"
                            onClick={() => {
                              close();
                              markInboxStatus({
                                status: 0,
                                snoozed_till: new Date(date),
                              });
                            }}
                          >
                            Snooze
                          </PrimaryButton>
                        </div>
                      )}
                    </Popover.Panel>
                  </Popover>
                </div>
              )}
              {isAllowed && (
                <div className={`flex gap-3 flex-wrap ${issueStatus !== -2 ? "opacity-70" : ""}`}>
                  <SecondaryButton
                    size="sm"
                    className="flex gap-2 items-center"
                    onClick={() => setSelectDuplicateIssue(true)}
                    disabled={issueStatus !== -2}
                  >
                    <StackedLayersHorizontalIcon className="h-4 w-4 text-brand-secondary" />
                    <span>Mark as duplicate</span>
                  </SecondaryButton>
                  <SecondaryButton
                    size="sm"
                    className="flex gap-2 items-center"
                    onClick={handleAcceptIssue}
                    disabled={issueStatus !== -2}
                    loading={isAccepting}
                  >
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>{isAccepting ? "Accepting..." : "Accept"}</span>
                  </SecondaryButton>
                  <SecondaryButton
                    size="sm"
                    className="flex gap-2 items-center"
                    onClick={() => setDeclineIssueModal(true)}
                    disabled={issueStatus !== -2}
                  >
                    <XCircleIcon className="h-4 w-4 text-red-500" />
                    <span>Decline</span>
                  </SecondaryButton>
                </div>
              )}
              {(isAllowed || user?.id === issue?.created_by) && (
                <div className="flex-shrink-0">
                  <SecondaryButton
                    size="sm"
                    className="flex gap-2 items-center"
                    onClick={() => setDeleteIssueModal(true)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                    <span>Delete</span>
                  </SecondaryButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
