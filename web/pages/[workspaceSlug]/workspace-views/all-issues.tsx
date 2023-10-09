import { useRouter } from "next/router";
import useSWR from "swr";

// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// layouts
import { WorkspaceAuthorizationLayout } from "layouts/auth-layout-legacy";
// components
import { GlobalViewsHeader } from "components/workspace";
// ui
import { PrimaryButton } from "components/ui";
// icons
import { CheckCircle, Plus } from "lucide-react";
// fetch-keys
import { GLOBAL_VIEW_ISSUES } from "constants/fetch-keys";

const GlobalViewAllIssues = () => {
  const router = useRouter();
  const { workspaceSlug } = router.query;

  const { globalViewIssues: globalViewIssuesStore } = useMobxStore();

  // useSWR(
  //   workspaceSlug ? GLOBAL_VIEW_ISSUES("all-issues", {}) : null,
  //   workspaceSlug ? () => globalViewIssuesStore.fetchViewIssues(workspaceSlug.toString()) : null
  // );

  return (
    <WorkspaceAuthorizationLayout
      breadcrumbs={
        <div className="flex gap-2 items-center">
          <CheckCircle size={18} strokeWidth={1.5} />
          <span className="text-sm font-medium">Workspace issues</span>
        </div>
      }
      right={
        <div className="flex items-center gap-2">
          <PrimaryButton
            className="flex items-center gap-2"
            onClick={() => {
              const e = new KeyboardEvent("keydown", { key: "c" });
              document.dispatchEvent(e);
            }}
          >
            <Plus size={14} strokeWidth={1.5} />
            Add Issue
          </PrimaryButton>
        </div>
      }
    >
      <div className="h-full flex flex-col overflow-hidden bg-custom-background-100">
        <div className="h-full w-full border-b border-custom-border-300">
          <GlobalViewsHeader />
          <div className="h-full w-full flex flex-col">
            {/* TODO: applied filters list */}
            {/* <SpreadsheetView
            spreadsheetIssues={viewIssues}
            mutateIssues={mutateViewIssues}
            handleIssueAction={handleIssueAction}
            disableUserActions={false}
            user={user}
            userAuth={memberRole}
          /> */}
          </div>
        </div>
      </div>
    </WorkspaceAuthorizationLayout>
  );
};

export default GlobalViewAllIssues;
