import { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { Plus } from "lucide-react";
// hooks
import { useMobxStore } from "lib/mobx/store-provider";
// ui
import { Breadcrumbs, BreadcrumbItem, Button } from "@plane/ui";
// helper
import { truncateText } from "helpers/string.helper";

export const ProjectViewsHeader: FC = observer(() => {
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
        <div>
          <Breadcrumbs onBack={() => router.back()}>
            <BreadcrumbItem
              link={
                <Link href={`/${workspaceSlug}/projects`}>
                  <a className={`border-r-2 border-custom-sidebar-border-200 px-3 text-sm `}>
                    <p>Projects</p>
                  </a>
                </Link>
              }
            />
            <BreadcrumbItem title={`${truncateText(projectDetails?.name ?? "Project", 32)} Views`} />
          </Breadcrumbs>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          prependIcon={<Plus />}
          size="sm"
          onClick={() => {
            const e = new KeyboardEvent("keydown", { key: "v" });
            document.dispatchEvent(e);
          }}
        >
          Create View
        </Button>
      </div>
    </div>
  );
});
