import React from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
// hooks
import { useMobxStore } from "lib/mobx/store-provider";
import useProjectDetails from "hooks/use-project-details";
// components
import { IssueGanttBlock } from "components/issues";
import {
  GanttChartRoot,
  IBlockUpdateData,
  renderIssueBlocksStructure,
  IssueGanttSidebar,
} from "components/gantt-chart";
// types
import { IIssueUnGroupedStructure } from "store/issue";
import { IIssue } from "types";
import {
  ICycleIssuesFilterStore,
  ICycleIssuesStore,
  IModuleIssuesFilterStore,
  IModuleIssuesStore,
  IProjectIssuesFilterStore,
  IProjectIssuesStore,
} from "store/issues";
import { EUserWorkspaceRoles } from "layouts/settings-layout/workspace/sidebar";
import { TUnGroupedIssues } from "store/issues/types";

interface IBaseGanttRoot {
  issueFiltersStore: IProjectIssuesFilterStore | IModuleIssuesFilterStore | ICycleIssuesFilterStore;
  issueRootStore: IProjectIssuesStore | IModuleIssuesStore | ICycleIssuesStore;
}

export const BaseGanttRoot: React.FC<IBaseGanttRoot> = observer((props: IBaseGanttRoot) => {
  const { issueFiltersStore, issueRootStore } = props;

  const router = useRouter();
  const { workspaceSlug } = router.query;

  const { projectDetails } = useProjectDetails();

  const { issue: issueStore } = useMobxStore();

  const appliedDisplayFilters = issueFiltersStore.issueFilters?.displayFilters;

  const issuesResponse = issueRootStore.getIssues;
  const issueIds = (issueRootStore.getIssuesIds ?? []) as TUnGroupedIssues;

  const issues = issueIds.map((id) => issuesResponse?.[id]);

  const updateIssue = (block: IIssue, payload: IBlockUpdateData) => {
    if (!workspaceSlug) return;

    issueStore.updateGanttIssueStructure(workspaceSlug.toString(), block, payload);
  };

  const isAllowed = (projectDetails?.member_role || 0) >= EUserWorkspaceRoles.MEMBER;

  return (
    <>
      <div className="w-full h-full">
        <GanttChartRoot
          border={false}
          title="Issues"
          loaderTitle="Issues"
          blocks={issues ? renderIssueBlocksStructure(issues as IIssueUnGroupedStructure) : null}
          blockUpdateHandler={updateIssue}
          blockToRender={(data: IIssue) => <IssueGanttBlock data={data} handleIssue={updateIssue} />}
          sidebarToRender={(props) => <IssueGanttSidebar {...props} enableQuickIssueCreate />}
          enableBlockLeftResize={isAllowed}
          enableBlockRightResize={isAllowed}
          enableBlockMove={isAllowed}
          enableReorder={appliedDisplayFilters?.order_by === "sort_order" && isAllowed}
        />
      </div>
    </>
  );
});
