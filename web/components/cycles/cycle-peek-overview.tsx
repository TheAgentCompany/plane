import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { useRouter } from "next/router";
// hooks
import { useCycle } from "@/hooks/store";
// components
import { CycleDetailsSidebar } from "./sidebar";

type Props = {
  projectId: string;
  workspaceSlug: string;
  isArchived?: boolean;
};

export const CyclePeekOverview: React.FC<Props> = observer(({ projectId, workspaceSlug, isArchived = false }) => {
  // router
  const router = useRouter();
  const { peekCycle } = router.query;
  // refs
  const ref = React.useRef(null);
  // store hooks
  const { fetchCycleDetails } = useCycle();

  const handleClose = () => {
    delete router.query.peekCycle;
    router.push({
      pathname: router.pathname,
      query: { ...router.query },
    });
  };

  useEffect(() => {
    if (!peekCycle || isArchived) return;
    fetchCycleDetails(workspaceSlug, projectId, peekCycle.toString());
  }, [fetchCycleDetails, isArchived, peekCycle, projectId, workspaceSlug]);

  return (
    <>
      {peekCycle && (
        <div
          ref={ref}
          className="flex h-full w-full max-w-[24rem] flex-shrink-0 flex-col gap-3.5 overflow-y-auto border-l border-custom-border-100 bg-custom-sidebar-background-100 px-6 duration-300 fixed md:relative right-0 z-[9]"
          style={{
            boxShadow:
              "0px 1px 4px 0px rgba(0, 0, 0, 0.06), 0px 2px 4px 0px rgba(16, 24, 40, 0.06), 0px 1px 8px -1px rgba(16, 24, 40, 0.06)",
          }}
        >
          <CycleDetailsSidebar
            cycleId={peekCycle?.toString() ?? ""}
            handleClose={handleClose}
            isArchived={isArchived}
          />
        </div>
      )}
    </>
  );
});
