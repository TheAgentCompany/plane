"use client";

import { useState } from "react";
import { Placement } from "@popperjs/core";
import omit from "lodash/omit";
import { observer } from "mobx-react";
// icons
import { Copy, Pencil, SquareStackIcon, Trash2 } from "lucide-react";
// types
import { TWorkspaceDraftIssue } from "@plane/types";
// ui
import { ContextMenu, CustomMenu, TContextMenuItem } from "@plane/ui";
// components
import { CreateUpdateIssueModal } from "@/components/issues";
// constant
import { EIssuesStoreType } from "@/constants/issue";
// helpers
import { cn } from "@/helpers/common.helper";
// local components
import { WorkspaceDraftIssueDeleteIssueModal } from "./delete-modal";

export interface IQuickActionProps {
  issue: TWorkspaceDraftIssue;
  handleDelete: () => Promise<void>;
  handleUpdate: (payload: Partial<TWorkspaceDraftIssue>) => Promise<TWorkspaceDraftIssue | undefined>;
  handleMoveToIssues?: () => Promise<void>;
  customActionButton?: React.ReactElement;
  portalElement?: HTMLDivElement | null;
  placements?: Placement;
  parentRef: React.RefObject<HTMLElement>;
}

export const WorkspaceDraftIssueQuickActions: React.FC<IQuickActionProps> = observer((props) => {
  const {
    issue,
    handleDelete,
    handleUpdate,
    handleMoveToIssues,
    customActionButton,
    portalElement,
    placements = "bottom-end",
    parentRef,
  } = props;
  // states
  const [moveToIssue, setMoveToIssue] = useState(false);
  const [createUpdateIssueModal, setCreateUpdateIssueModal] = useState(false);
  const [issueToEdit, setIssueToEdit] = useState<TWorkspaceDraftIssue | undefined>(undefined);
  const [deleteIssueModal, setDeleteIssueModal] = useState(false);

  const duplicateIssuePayload = omit(
    {
      ...issue,
      name: `${issue.name} (copy)`,
      is_draft: true,
    },
    ["id"]
  );

  const MENU_ITEMS: TContextMenuItem[] = [
    {
      key: "edit",
      title: "Edit",
      icon: Pencil,
      action: () => {
        setIssueToEdit(issue);
        setCreateUpdateIssueModal(true);
      },
    },
    {
      key: "make-a-copy",
      title: "Make a copy",
      icon: Copy,
      action: () => {
        setCreateUpdateIssueModal(true);
      },
    },
    {
      key: "move-to-issues",
      title: "Move to project",
      icon: SquareStackIcon,
      action: () => {
        if (handleMoveToIssues) {
          setMoveToIssue(true);
          setIssueToEdit(issue);
          setCreateUpdateIssueModal(true);
        }
      },
    },
    {
      key: "delete",
      title: "Delete",
      icon: Trash2,
      action: () => {
        setDeleteIssueModal(true);
      },
    },
  ];

  return (
    <>
      <WorkspaceDraftIssueDeleteIssueModal
        data={issue}
        isOpen={deleteIssueModal}
        handleClose={() => setDeleteIssueModal(false)}
        onSubmit={handleDelete}
      />
      <CreateUpdateIssueModal
        isOpen={createUpdateIssueModal}
        onClose={() => {
          setCreateUpdateIssueModal(false);
          setIssueToEdit(undefined);
          setMoveToIssue(false);
        }}
        data={issueToEdit ?? duplicateIssuePayload}
        onSubmit={async (data) => {
          if (issueToEdit && handleUpdate) await handleUpdate(data as TWorkspaceDraftIssue);
        }}
        storeType={EIssuesStoreType.WORKSPACE_DRAFT}
        fetchIssueDetails={false}
        moveToIssue={moveToIssue}
        isDraft
      />
      <ContextMenu parentRef={parentRef} items={MENU_ITEMS} />
      <CustomMenu
        ellipsis
        customButton={customActionButton}
        portalElement={portalElement}
        placement={placements}
        menuItemsClassName="z-[14]"
        maxHeight="lg"
        useCaptureForOutsideClick
        closeOnSelect
      >
        {MENU_ITEMS.map((item) => (
          <CustomMenu.MenuItem
            key={item.key}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              item.action();
            }}
            className={cn(
              "flex items-center gap-2",
              {
                "text-custom-text-400": item.disabled,
              },
              item.className
            )}
            disabled={item.disabled}
          >
            {item.icon && <item.icon className={cn("h-3 w-3", item.iconClassName)} />}
            <div>
              <h5>{item.title}</h5>
              {item.description && (
                <p
                  className={cn("text-custom-text-300 whitespace-pre-line", {
                    "text-custom-text-400": item.disabled,
                  })}
                >
                  {item.description}
                </p>
              )}
            </div>
          </CustomMenu.MenuItem>
        ))}
      </CustomMenu>
    </>
  );
});
