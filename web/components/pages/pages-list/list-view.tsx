import { FC } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { Plus } from "lucide-react";
// hooks
import { useApplication, useUser } from "hooks/store";
// components
import { PagesListItem } from "./list-item";
import { NewEmptyState } from "components/common/new-empty-state";
// ui
import { Loader } from "@plane/ui";
// images
import emptyPage from "public/empty-state/empty_page.png";
// constants
import { EUserProjectRoles } from "constants/project";
import { useProjectSpecificPages } from "hooks/store/use-project-specific-pages";
import { IPageStore } from "store/page.store";
import { spy, trace } from "mobx";
import { useMobxDependencyLogger } from "hooks/store/use-mobx-dependency-logger";

// type IPagesListView = {
//   pageIds: string[];
// };

export const PagesListView: FC = observer(() => {
  // store hooks
  // trace(true);

  const {
    commandPalette: { toggleCreatePageModal },
  } = useApplication();
  const {
    membership: { currentProjectRole },
  } = useUser();
  // router
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;

  console.log("PageListViewRererendered");

  // here we are only observing the projectPageStore, so that we can re-render the component when the projectPageStore changes
  const projectPageStore = useProjectSpecificPages(projectId as string);
  // Now, I am observing only the projectPages, out of the projectPageStore.
  const { projectPages } = projectPageStore;
  const pageStores = projectPages[projectId as string];

  const isEditingAllowed = !!currentProjectRole && currentProjectRole >= EUserProjectRoles.MEMBER;

  return (
    <>
      {pageStores && workspaceSlug && projectId ? (
        <div className="h-full space-y-4 overflow-y-auto">
          {pageStores.length > 0 ? (
            <ul role="list" className="divide-y divide-custom-border-200">
              {pageStores.map((pageStore: IPageStore, index: number) => {
                console.log("PageListViewRererendered");
                return <PagesListItem key={index} pageStore={pageStore} />;
              })}
            </ul>
          ) : (
            <NewEmptyState
              title="Write a note, a doc, or a full knowledge base. Get Galileo, Plane’s AI assistant, to help you get started."
              description="Pages are thoughtspotting space in Plane. Take down meeting notes, format them easily, embed issues, lay them out using a library of components, and keep them all in your project’s context. To make short work of any doc, invoke Galileo, Plane’s AI, with a shortcut or the click of a button."
              image={emptyPage}
              comicBox={{
                title: "A page can be a doc or a doc of docs.",
                description:
                  "We wrote Parth and Meera’s love story. You could write your project’s mission, goals, and eventual vision.",
                direction: "right",
              }}
              primaryButton={{
                icon: <Plus className="h-4 w-4" />,
                text: "Create your first page",
                onClick: () => toggleCreatePageModal(true),
              }}
              disabled={!isEditingAllowed}
            />
          )}
        </div>
      ) : (
        <Loader className="space-y-4">
          <Loader.Item height="40px" />
          <Loader.Item height="40px" />
          <Loader.Item height="40px" />
        </Loader>
      )}
    </>
  );
});
