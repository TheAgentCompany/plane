import Link from "next/link";
import { useRouter } from "next/router";
// icons
import { Cog, Lock, Mail } from "lucide-react";
// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// ui
import { Tooltip, OpenAIIcon } from "@plane/ui";

const INSTANCE_ADMIN_LINKS = [
  {
    Icon: Cog,
    name: "General",
    href: `/admin`,
  },
  {
    Icon: Mail,
    name: "Mail",
    href: `/admin/mail`,
  },
  {
    Icon: Lock,
    name: "Authorization",
    href: `/admin/authorization`,
  },
  {
    Icon: OpenAIIcon,
    name: "Open AI",
    href: `/admin/openai`,
  },
];

export const InstanceAdminSidebarMenu = () => {
  const {
    theme: { sidebarCollapsed },
  } = useMobxStore();
  // router
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto w-full cursor-pointer space-y-2 p-4">
      {INSTANCE_ADMIN_LINKS.map((item, index) => {
        const isActive = item.name === "Settings" ? router.asPath.includes(item.href) : router.asPath === item.href;

        return (
          <Link key={index} href={item.href}>
            <a className="block w-full">
              <Tooltip tooltipContent={item.name} position="right" className="ml-2" disabled={!sidebarCollapsed}>
                <div
                  className={`group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium outline-none ${
                    isActive
                      ? "bg-custom-primary-100/10 text-custom-primary-100"
                      : "text-custom-sidebar-text-200 hover:bg-custom-sidebar-background-80 focus:bg-custom-sidebar-background-80"
                  } ${sidebarCollapsed ? "justify-center" : ""}`}
                >
                  {<item.Icon className="h-4 w-4" />}
                  {!sidebarCollapsed && item.name}
                </div>
              </Tooltip>
            </a>
          </Link>
        );
      })}
    </div>
  );
};
