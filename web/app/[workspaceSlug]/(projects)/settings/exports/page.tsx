"use client";

import { observer } from "mobx-react";
// components
import { NotAuthorizedView } from "@/components/auth-screens";
import { PageHead } from "@/components/core";
import ExportGuide from "@/components/exporter/guide";
// helpers
import { cn } from "@/helpers/common.helper";
// hooks
import { useUser, useWorkspace } from "@/hooks/store";

const ExportsPage = observer(() => {
  // store hooks
  const { canPerformWorkspaceViewerActions, canPerformWorkspaceMemberActions } = useUser();
  const { currentWorkspace } = useWorkspace();

  // derived values
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace.name} - Exports` : undefined;

  // if user is not authorized to view this page
  if (!canPerformWorkspaceViewerActions) {
    return <NotAuthorizedView section="general" />;
  }

  return (
    <>
      <PageHead title={pageTitle} />
      <div
        className={cn("w-full overflow-y-auto md:pr-9 pr-4", {
          "opacity-60": !canPerformWorkspaceMemberActions,
        })}
      >
        <div className="flex items-center border-b border-custom-border-100 py-3.5">
          <h3 className="text-xl font-medium">Exports</h3>
        </div>
        <ExportGuide />
      </div>
    </>
  );
});

export default ExportsPage;
