"use client";

import { FC } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Bell } from "lucide-react";
import { Breadcrumbs } from "@plane/ui";
// components
import { BreadcrumbLink } from "@/components/common";
import { SidebarHamburgerToggle } from "@/components/core";
import { SidebarOptions } from "@/components/workspace-notifications";

export const SidebarHeader: FC = observer(() => {
  const { workspaceSlug } = useParams();

  if (!workspaceSlug) return <></>;
  return (
    <div className="relative z-10 flex h-[3.75rem] w-full flex-shrink-0 flex-row items-center justify-between gap-x-2 gap-y-4 bg-custom-sidebar-background-100 p-4">
      <div className="flex w-full flex-grow items-center gap-2 overflow-ellipsis whitespace-nowrap">
        <div className="block bg-custom-sidebar-background-100 md:hidden">
          <SidebarHamburgerToggle />
        </div>
        <Breadcrumbs>
          <Breadcrumbs.BreadcrumbItem
            type="text"
            link={<BreadcrumbLink label="Notifications" icon={<Bell className="h-4 w-4 text-custom-text-300" />} />}
          />
        </Breadcrumbs>
      </div>

      <SidebarOptions workspaceSlug={workspaceSlug.toString()} />
    </div>
  );
});
