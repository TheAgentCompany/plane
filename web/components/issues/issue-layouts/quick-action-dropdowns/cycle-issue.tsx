import { useState } from "react";
import { useRouter } from "next/router";
import { CustomMenu } from "@plane/ui";
import { Archive, Copy, ExternalLink, Link, Pencil, Trash2, XCircle } from "lucide-react";
import omit from "lodash/omit";
// hooks
import useToast from "hooks/use-toast";
import { useEventTracker, useIssues, useUser } from "hooks/store";
// components
import { ArchiveIssueModal, CreateUpdateIssueModal, DeleteIssueModal } from "components/issues";
// helpers
import { copyUrlToClipboard } from "helpers/string.helper";
// types
import { TIssue } from "@plane/types";
import { IQuickActionProps } from "../list/list-view-types";
// constants
import { EIssuesStoreType } from "constants/issue";
import { EUserProjectRoles } from "constants/project";

export const CycleIssueQuickActions: React.FC<IQuickActionProps> = (props) => {
  const {
    issue,
    handleDelete,
    handleUpdate,
    handleRemoveFromView,
    handleArchive,
    customActionButton,
    portalElement,
    readOnly = false,
  } = props;
  // states
  const [createUpdateIssueModal, setCreateUpdateIssueModal] = useState(false);
  const [issueToEdit, setIssueToEdit] = useState<TIssue | undefined>(undefined);
  const [deleteIssueModal, setDeleteIssueModal] = useState(false);
  const [archiveIssueModal, setArchiveIssueModal] = useState(false);
  // router
  const router = useRouter();
  const { workspaceSlug, cycleId } = router.query;
  // store hooks
  const { setTrackElement } = useEventTracker();
  const { issuesFilter } = useIssues(EIssuesStoreType.CYCLE);
  // toast alert
  const { setToastAlert } = useToast();

  // store hooks
  const {
    membership: { currentProjectRole },
  } = useUser();

  const isEditingAllowed = !!currentProjectRole && currentProjectRole >= EUserProjectRoles.MEMBER && !readOnly;
  const isArchivingAllowed = handleArchive && isEditingAllowed;
  const isDeletingAllowed = isEditingAllowed;

  const activeLayout = `${issuesFilter.issueFilters?.displayFilters?.layout} layout`;

  const issueLink = `${workspaceSlug}/projects/${issue.project_id}/issues/${issue.id}`;

  const handleOpenInNewTab = () => window.open(`/${issueLink}}`, "_blank");

  const handleCopyIssueLink = () =>
    copyUrlToClipboard(issueLink).then(() =>
      setToastAlert({
        type: "success",
        title: "Link copied",
        message: "Issue link copied to clipboard",
      })
    );

  const duplicateIssuePayload = omit(
    {
      ...issue,
      name: `${issue.name} (copy)`,
    },
    ["id"]
  );

  return (
    <>
      <ArchiveIssueModal
        data={issue}
        isOpen={archiveIssueModal}
        handleClose={() => setArchiveIssueModal(false)}
        onSubmit={handleArchive}
      />
      <DeleteIssueModal
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
        }}
        data={issueToEdit ?? duplicateIssuePayload}
        onSubmit={async (data) => {
          if (issueToEdit && handleUpdate) await handleUpdate({ ...issueToEdit, ...data });
        }}
        storeType={EIssuesStoreType.CYCLE}
      />
      <CustomMenu
        placement="bottom-start"
        customButton={customActionButton}
        portalElement={portalElement}
        closeOnSelect
        ellipsis
      >
        {isEditingAllowed && (
          <CustomMenu.MenuItem
            onClick={() => {
              setIssueToEdit({
                ...issue,
                cycle_id: cycleId?.toString() ?? null,
              });
              setTrackElement(activeLayout);
              setCreateUpdateIssueModal(true);
            }}
          >
            <div className="flex items-center gap-2">
              <Pencil className="h-3 w-3" />
              Edit
            </div>
          </CustomMenu.MenuItem>
        )}
        <CustomMenu.MenuItem onClick={handleOpenInNewTab}>
          <div className="flex items-center gap-2">
            <ExternalLink className="h-3 w-3" />
            Open in new tab
          </div>
        </CustomMenu.MenuItem>
        <CustomMenu.MenuItem onClick={handleCopyIssueLink}>
          <div className="flex items-center gap-2">
            <Link className="h-3 w-3" />
            Copy link
          </div>
        </CustomMenu.MenuItem>
        {isEditingAllowed && (
          <CustomMenu.MenuItem
            onClick={() => {
              setTrackElement(activeLayout);
              setCreateUpdateIssueModal(true);
            }}
          >
            <div className="flex items-center gap-2">
              <Copy className="h-3 w-3" />
              Make a copy
            </div>
          </CustomMenu.MenuItem>
        )}
        {isEditingAllowed && (
          <CustomMenu.MenuItem
            onClick={() => {
              handleRemoveFromView && handleRemoveFromView();
            }}
          >
            <div className="flex items-center gap-2">
              <XCircle className="h-3 w-3" />
              Remove from cycle
            </div>
          </CustomMenu.MenuItem>
        )}
        {isArchivingAllowed && (
          <CustomMenu.MenuItem onClick={() => setArchiveIssueModal(true)}>
            <div className="flex items-center gap-2">
              <Archive className="h-3 w-3" />
              Archive
            </div>
          </CustomMenu.MenuItem>
        )}
        {isDeletingAllowed && (
          <CustomMenu.MenuItem
            onClick={() => {
              setTrackElement(activeLayout);
              setDeleteIssueModal(true);
            }}
          >
            <div className="flex items-center gap-2">
              <Trash2 className="h-3 w-3" />
              Delete
            </div>
          </CustomMenu.MenuItem>
        )}
      </CustomMenu>
    </>
  );
};
