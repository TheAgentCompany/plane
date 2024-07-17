"use client";

import React from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
// components
import { Tooltip } from "@plane/ui";
import { SidebarNavigation } from "@/components/sidebar";
import { NotificationAppSidebarOption } from "@/components/workspace-notifications";
// constants
import { SIDEBAR_USER_MENU_ITEMS } from "@/constants/dashboard";
import { SIDEBAR_CLICKED } from "@/constants/event-tracker";
import { EUserWorkspaceRoles } from "@/constants/workspace";
// helpers
import { cn } from "@/helpers/common.helper";
// hooks
import { useAppTheme, useEventTracker, useUser } from "@/hooks/store";
import { usePlatformOS } from "@/hooks/use-platform-os";

export const SidebarUserMenu = observer(() => {
  // store hooks
  const { toggleSidebar, sidebarCollapsed } = useAppTheme();
  const { captureEvent } = useEventTracker();
  const { isMobile } = usePlatformOS();
  const {
    membership: { currentWorkspaceRole },
    data: currentUser,
  } = useUser();
  // router params
  const { workspaceSlug } = useParams();
  // pathname
  const pathname = usePathname();
  // computed
  const workspaceMemberInfo = currentWorkspaceRole || EUserWorkspaceRoles.GUEST;

  const handleLinkClick = (itemKey: string) => {
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
    captureEvent(SIDEBAR_CLICKED, {
      destination: itemKey,
    });
  };

  const notificationIndicatorElement = (
    <NotificationAppSidebarOption
      workspaceSlug={workspaceSlug.toString()}
      isSidebarCollapsed={sidebarCollapsed ?? false}
    />
  );

  return (
    <div
      className={cn("flex flex-col gap-0.5", {
        "space-y-0": sidebarCollapsed,
      })}
    >
      {SIDEBAR_USER_MENU_ITEMS.map(
        (link) =>
          workspaceMemberInfo >= link.access && (
            <Tooltip
              key={link.key}
              tooltipContent={link.label}
              position="right"
              className="ml-2"
              disabled={!sidebarCollapsed}
              isMobile={isMobile}
            >
              <Link
                href={`/${workspaceSlug}${link.href}${link.key === "my-work" ? `/${currentUser?.id}` : ""}`}
                onClick={() => handleLinkClick(link.key)}
              >
                <SidebarNavigation
                  key={link.key}
                  label={<>{!sidebarCollapsed && <p className="text-sm leading-5 font-medium">{link.label}</p>}</>}
                  className={`${sidebarCollapsed ? "p-0 size-8 aspect-square justify-center mx-auto" : ""}`}
                  icon={<link.Icon className="size-4 flex-shrink-0" />}
                  isActive={link.highlight(pathname, `/${workspaceSlug}`)}
                  indicatorElement={link.key === "notifications" ? notificationIndicatorElement : undefined}
                />
              </Link>
            </Tooltip>
          )
      )}
    </div>
  );
});
