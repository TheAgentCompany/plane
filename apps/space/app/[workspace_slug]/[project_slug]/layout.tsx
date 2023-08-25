// next imports
import Link from "next/link";
import Image from "next/image";
import { Metadata, ResolvingMetadata } from "next";
// components
import IssueNavbar from "components/issues/navbar";
import IssueFilter from "components/issues/filters-render";
// service
import ProjectService from "services/project.service";
import { redirect } from "next/navigation";

type LayoutProps = {
  params: { workspace_slug: string; project_slug: string };
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  // read route params
  const { workspace_slug, project_slug } = params;
  const projectServiceInstance = new ProjectService();

  try {
    const project = await projectServiceInstance?.getProjectSettingsAsync(workspace_slug, project_slug);

    return {
      title: `${project?.project_details?.name} | ${workspace_slug}`,
      description: `${
        project?.project_details?.description || `${project?.project_details?.name} | ${workspace_slug}`
      }`,
      icons: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${
        typeof project?.project_details?.emoji != "object"
          ? String.fromCodePoint(parseInt(project?.project_details?.emoji))
          : "✈️"
      }</text></svg>`,
    };
  } catch (error: any) {
    if (error?.data?.error) {
      redirect(`/project-not-published`);
    }
    return {};
  }
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-screen min-h-[500px] h-screen overflow-hidden flex flex-col">
    <div className="flex-shrink-0 h-[60px] border-b border-custom-border-300 relative flex items-center bga-white select-none">
      <IssueNavbar />
    </div>
    <IssueFilter />
    <div className="w-full h-full relative overflow-hidden">{children}</div>

    <div className="absolute z-[99999] bottom-[10px] right-[10px] bg-custom-background-100 rounded-sm shadow-lg border border-custom-border-200">
      <Link href="https://plane.so" className="p-1 px-2 flex items-center gap-1" target="_blank">
        <div className="w-[24px] h-[24px] relative flex justify-center items-center">
          <Image src="/plane-logo.webp" alt="plane logo" className="w-[24px] h-[24px]" height="24" width="24" />
        </div>
        <div className="text-xs text-custom-text-200">
          Powered by <b>Plane Deploy</b>
        </div>
      </Link>
    </div>
  </div>
);

export default RootLayout;
