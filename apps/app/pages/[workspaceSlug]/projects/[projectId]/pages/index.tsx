import { useEffect, useState } from "react";

import { useRouter } from "next/router";
import type { GetServerSidePropsContext, NextPage } from "next";

import useSWR from "swr";

// lib
import { requiredAuth } from "lib/auth";

// services
import projectService from "services/project.service";
import pagesService from "services/pages.service";
// icons
import { PlusIcon } from "components/icons";
// layouts
import AppLayout from "layouts/app-layout";
// ui
import { BreadcrumbItem, Breadcrumbs } from "components/breadcrumbs";
// fetching keys
import { PAGE_LIST, PROJECT_DETAILS } from "constants/fetch-keys";
// components
import { HeaderButton } from "components/ui";
import { CreateUpdatePageModal } from "components/pages/create-update-page-modal";
import { PagesList } from "components/pages/pages-list";
import { IPage } from "types";
import PagesMasonry from "components/pages/pages-masonry";

const ProjectPages: NextPage = () => {
  const [isCreateUpdatePageModalOpen, setIsCreateUpdatePageModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<IPage>();

  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;

  const { data: activeProject } = useSWR(
    workspaceSlug && projectId ? PROJECT_DETAILS(projectId as string) : null,
    workspaceSlug && projectId
      ? () => projectService.getProject(workspaceSlug as string, projectId as string)
      : null
  );

  const { data: pages } = useSWR(
    workspaceSlug && projectId ? PAGE_LIST(projectId as string) : null,
    workspaceSlug && projectId
      ? () => pagesService.listPages(workspaceSlug as string, projectId as string)
      : null
  );

  useEffect(() => {
    if (isCreateUpdatePageModalOpen) return;
    const timer = setTimeout(() => {
      setSelectedPage(undefined);
      clearTimeout(timer);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [isCreateUpdatePageModalOpen]);

  return (
    <AppLayout
      meta={{
        title: "Plane - Pages",
      }}
      breadcrumbs={
        <Breadcrumbs>
          <BreadcrumbItem title="Projects" link={`/${workspaceSlug}/projects`} />
          <BreadcrumbItem title={`${activeProject?.name ?? "Project"} Pages`} />
        </Breadcrumbs>
      }
      right={
        <HeaderButton
          Icon={PlusIcon}
          label="Create Page"
          onClick={() => setIsCreateUpdatePageModalOpen(true)}
        />
      }
    >
      <CreateUpdatePageModal
        isOpen={isCreateUpdatePageModalOpen}
        handleClose={() => setIsCreateUpdatePageModalOpen(false)}
        data={selectedPage}
      />
      <div className="space-y-4">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white px-4 pt-3 pb-4 shadow-sm ">
          <label htmlFor="name" className="sr-only">
            Title
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className="block w-full border-0 pt-2.5 text-lg font-medium placeholder-gray-500 outline-none focus:ring-0"
            placeholder="Title"
          />
          <label htmlFor="description" className="sr-only">
            Description
          </label>
          <textarea
            rows={2}
            name="description"
            id="description"
            className="block w-full resize-none border-0 pb-8 placeholder-gray-500 outline-none focus:ring-0 sm:text-sm"
            placeholder="Write something..."
            defaultValue={""}
          />
        </div>

        {/* <div className="space-y-2 pb-8">
          <h3 className="text-3xl font-semibold text-black">Pages</h3>
          <p className="text-sm text-gray-500">
            Note down all the important and minor details in the way you want to.
          </p>
        </div> */}
        <PagesList
          setSelectedPage={setSelectedPage}
          setCreateUpdatePageModal={setIsCreateUpdatePageModalOpen}
          pages={pages}
        />
        <PagesMasonry />
      </div>
    </AppLayout>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const user = await requiredAuth(ctx.req?.headers.cookie);

  const redirectAfterSignIn = ctx.resolvedUrl;

  if (!user) {
    return {
      redirect: {
        destination: `/signin?next=${redirectAfterSignIn}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      user,
    },
  };
};

export default ProjectPages;
