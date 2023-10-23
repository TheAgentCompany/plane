import { FC } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { ArrowLeft } from "lucide-react";
// hooks
import { useMobxStore } from "lib/mobx/store-provider";
// ui
import { Breadcrumbs, BreadcrumbItem } from "@plane/ui";
// helper
import { truncateText } from "helpers/string.helper";

export const ProjectDraftIssueHeader: FC = observer(() => {
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;

  const { project: projectStore } = useMobxStore();

  const projectDetails =
    workspaceSlug && projectId
      ? projectStore.getProjectById(workspaceSlug.toString(), projectId.toString())
      : undefined;

  return (
    <div className="relative flex w-full flex-shrink-0 flex-row z-10 items-center justify-between gap-x-2 gap-y-4 border-b border-custom-border-200 bg-custom-sidebar-background-100 p-4">
      <div className="flex items-center gap-2 flex-grow w-full whitespace-nowrap overflow-ellipsis">
        <div className="block md:hidden">
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded border border-custom-border-200"
            onClick={() => router.back()}
          >
            <ArrowLeft fontSize={14} strokeWidth={2} />
          </button>
        </div>
        <div>
          <Breadcrumbs onBack={() => router.back()}>
            <span className="border-r-2 border-custom-sidebar-border-200 px-3 text-sm">
              <BreadcrumbItem title={`${truncateText(projectDetails?.name ?? "Project", 32)} Draft Issues`} />
            </span>
          </Breadcrumbs>
        </div>
      </div>
    </div>
  );
});
