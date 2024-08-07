"use client";

import React, { useEffect, useRef, useState } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { observer } from "mobx-react";
import { useParams, useRouter } from "next/navigation";
import { Briefcase, FileText, Layers, MoreHorizontal, Star } from "lucide-react";
// ui
import { IFavorite } from "@plane/types";
import {
  ContrastIcon,
  ControlLink,
  CustomMenu,
  DiceIcon,
  DragHandle,
  FavoriteFolderIcon,
  LayersIcon,
  Tooltip,
} from "@plane/ui";
// components
import { Logo } from "@/components/common";
import { SidebarNavItem } from "@/components/sidebar";

// helpers
import { cn } from "@/helpers/common.helper";
// hooks
import { useAppTheme } from "@/hooks/store";
import useOutsideClickDetector from "@/hooks/use-outside-click-detector";
import { usePlatformOS } from "@/hooks/use-platform-os";

const iconClassName = `flex-shrink-0 size-4 stroke-[1.5] m-auto`;
const ICONS: Record<string, JSX.Element> = {
  page: <FileText className={iconClassName} />,
  project: <Briefcase className={iconClassName} />,
  view: <Layers className={iconClassName} />,
  module: <DiceIcon className={iconClassName} />,
  cycle: <ContrastIcon className={iconClassName} />,
  issue: <LayersIcon className={iconClassName} />,
  folder: <FavoriteFolderIcon className={iconClassName} />,
};

export const FavoriteItem = observer(
  ({
    favoriteMap,
    favorite,
    handleRemoveFromFavorites,
    handleRemoveFromFavoritesFolder,
  }: {
    favorite: IFavorite;
    favoriteMap: Record<string, IFavorite>;
    handleRemoveFromFavorites: (favorite: IFavorite) => void;
    handleRemoveFromFavoritesFolder: (favoriteId: string) => void;
  }) => {
    // store hooks
    const { sidebarCollapsed } = useAppTheme();
    const { isMobile } = usePlatformOS();
    //state
    const [isDragging, setIsDragging] = useState(false);
    const [isMenuActive, setIsMenuActive] = useState(false);

    // router params
    const router = useRouter();
    const { workspaceSlug } = useParams();
    // derived values

    //ref
    const elementRef = useRef<HTMLDivElement>(null);
    const dragHandleRef = useRef<HTMLButtonElement | null>(null);
    const actionSectionRef = useRef<HTMLDivElement | null>(null);

    const getIcon = () => (
      <>
        <div className="hidden group-hover:flex items-center justify-center size-5">
          {ICONS[favorite.entity_type] || <FileText />}
        </div>
        <div className="flex items-center justify-center size-5 group-hover:hidden">
          {favorite.entity_data?.logo_props?.in_use ? (
            <Logo
              logo={favorite.entity_data?.logo_props}
              size={16}
              type={favorite.entity_type === "project" ? "material" : "lucide"}
            />
          ) : (
            ICONS[favorite.entity_type] || <FileText />
          )}
        </div>
      </>
    );

    const getLink = () => {
      switch (favorite.entity_type) {
        case "project":
          return `/${workspaceSlug}/projects/${favorite.project_id}/issues`;
        case "cycle":
          return `/${workspaceSlug}/projects/${favorite.project_id}/cycles/${favorite.entity_identifier}`;
        case "module":
          return `/${workspaceSlug}/projects/${favorite.project_id}/modules/${favorite.entity_identifier}`;
        case "view":
          return `/${workspaceSlug}/projects/${favorite.project_id}/views/${favorite.entity_identifier}`;
        case "page":
          return `/${workspaceSlug}/projects/${favorite.project_id}/pages/${favorite.entity_identifier}`;
        default:
          return `/${workspaceSlug}`;
      }
    };

    useEffect(() => {
      const element = elementRef.current;

      if (!element) return;

      return combine(
        draggable({
          element,
          // dragHandle: element,
          canDrag: () => true,
          getInitialData: () => ({ id: favorite.id, type: "CHILD" }),
          onDragStart: () => {
            setIsDragging(true);
          },
          onDrop: () => {
            setIsDragging(false);
          },
        }),
        dropTargetForElements({
          element,
          onDragStart: () => {
            setIsDragging(true);
          },
          onDragEnter: () => {
            setIsDragging(true);
          },
          onDragLeave: () => {
            setIsDragging(false);
          },
          onDrop: ({ source }) => {
            setIsDragging(false);
            const sourceId = source?.data?.id as string | undefined;
            if (!sourceId || !favoriteMap[sourceId].parent) return;
            handleRemoveFromFavoritesFolder(sourceId);
          },
        })
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elementRef?.current, isDragging]);
    useOutsideClickDetector(actionSectionRef, () => setIsMenuActive(false));

    return (
      <>
        {sidebarCollapsed ? (
          <div ref={elementRef}>
            <ControlLink
              href={getLink()}
              onClick={() => router.push(getLink())}
              className={cn(
                "group/project-item cursor-pointer relative group w-full flex items-center justify-center gap-1.5 rounded px-2 py-1 outline-none text-custom-sidebar-text-200 hover:bg-custom-sidebar-background-90 active:bg-custom-sidebar-background-90 truncate p-0 size-8 aspect-square mx-auto"
              )}
            >
              <span className="flex items-center justify-center size-5">{getIcon()}</span>
            </ControlLink>
          </div>
        ) : (
          <div
            ref={elementRef}
            className={cn(
              "group/project-item cursor-pointer relative group flex items-center justify-between w-full gap-1.5 rounded px-2 py-1 outline-none text-custom-sidebar-text-200 hover:bg-custom-sidebar-background-90 active:bg-custom-sidebar-background-90",
              {
                "bg-custom-sidebar-background-90": isMenuActive,
              }
            )}
          >
            <Tooltip
              isMobile={isMobile}
              tooltipContent={favorite.sort_order === null ? "Join the project to rearrange" : "Drag to rearrange"}
              position="top-right"
              disabled={isDragging}
            >
              <button
                type="button"
                className={cn(
                  "hidden group-hover/project-item:flex items-center justify-center absolute top-1/2 -left-3 -translate-y-1/2 rounded text-custom-sidebar-text-400 cursor-grab",
                  {
                    "cursor-not-allowed opacity-60": favorite.sort_order === null,
                    "cursor-grabbing": isDragging,
                  }
                )}
                ref={dragHandleRef}
              >
                <DragHandle className="bg-transparent" />
              </button>
            </Tooltip>
            <ControlLink
              onClick={() => router.push(getLink())}
              href={getLink()}
              className="flex items-center gap-1.5 truncate w-full"
            >
              <div className="flex items-center justify-center size-5">{getIcon()}</div>
              <span className="text-sm leading-5 font-medium flex-1 truncate">
                {favorite.entity_data ? favorite.entity_data.name : favorite.name}
              </span>
            </ControlLink>
            <CustomMenu
              customButton={
                <span
                  ref={actionSectionRef}
                  className="grid place-items-center p-0.5 text-custom-sidebar-text-400 hover:bg-custom-sidebar-background-80 rounded"
                  onClick={() => setIsMenuActive(!isMenuActive)}
                >
                  <MoreHorizontal className="size-4" />
                </span>
              }
              className={cn(
                "opacity-0 pointer-events-none flex-shrink-0 group-hover/project-item:opacity-100 group-hover/project-item:pointer-events-auto",
                {
                  "opacity-100 pointer-events-auto": isMenuActive,
                }
              )}
              customButtonClassName="grid place-items-center"
              placement="bottom-start"
            >
              <CustomMenu.MenuItem onClick={() => handleRemoveFromFavorites(favorite)}>
                <span className="flex items-center justify-start gap-2">
                  <Star className="h-3.5 w-3.5 fill-yellow-500 stroke-yellow-500" />
                  <span>Remove from favorites</span>
                </span>
              </CustomMenu.MenuItem>
            </CustomMenu>
          </div>
        )}
      </>
    );
  }
);
