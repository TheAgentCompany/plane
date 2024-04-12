import { FC, useEffect } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
// types
import { TPageNavigationTabs } from "@plane/types";
// helpers
import { cn } from "@/helpers/common.helper";
// hooks
import { useProjectPages } from "@/hooks/store";

type TPageTabNavigation = {
  workspaceSlug: string;
  projectId: string;
  pageType: TPageNavigationTabs;
};

// pages tab options
const pageTabs: { key: TPageNavigationTabs; label: string }[] = [
  {
    key: "public",
    label: "Public",
  },
  {
    key: "private",
    label: "Private",
  },
  {
    key: "archived",
    label: "Archived",
  },
];

export const PageTabNavigation: FC<TPageTabNavigation> = observer((props) => {
  const { workspaceSlug, projectId, pageType } = props;
  // store hooks
  const { pageType: storePageType, updatePageType } = useProjectPages(projectId);

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, tabKey: TPageNavigationTabs) => {
    if (tabKey === pageType) e.preventDefault();
  };

  useEffect(() => {
    if (storePageType !== pageType) updatePageType(pageType);
  }, [storePageType, pageType, updatePageType]);

  return (
    <div className="relative flex items-center">
      {pageTabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/${workspaceSlug}/projects/${projectId}/pages?type=${tab.key}`}
          onClick={(e) => handleTabClick(e, tab.key)}
        >
          <span
            className={cn(`block p-3 py-4 text-sm font-medium transition-all`, {
              "text-custom-primary-100": tab.key === pageType,
            })}
          >
            {tab.label}
          </span>
          <div
            className={cn(`rounded-t border-t-2 transition-all border-transparent`, {
              "border-custom-primary-100": tab.key === pageType,
            })}
          />
        </Link>
      ))}
    </div>
  );
});
