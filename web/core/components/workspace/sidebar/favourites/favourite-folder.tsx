"use client";

import { useEffect, useRef, useState } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { useParams } from "next/navigation";
import { PenSquare, Star, MoreHorizontal, ChevronRight } from "lucide-react";
import { Disclosure, Transition } from "@headlessui/react";
// ui
import { IFavourite } from "@plane/types";
import { CustomMenu, Tooltip, DropIndicator, setToast, TOAST_TYPE, FavouriteFolderIcon } from "@plane/ui";

// helpers
import { cn } from "@/helpers/common.helper";
// hooks
import { useAppTheme } from "@/hooks/store";
import { useFavourite } from "@/hooks/store/use-favourite";
import useOutsideClickDetector from "@/hooks/use-outside-click-detector";
import { usePlatformOS } from "@/hooks/use-platform-os";
// constants
import { FavouriteItem } from "./favourite-item";
import { NewFavouriteFolder } from "./new-fav-folder";

type Props = {
  isLastChild: boolean;
  favourite: IFavourite;
  handleRemoveFromFavorites: (favourite: IFavourite) => void;
};

export const FavouriteFolder: React.FC<Props> = (props) => {
  const { isLastChild, favourite, handleRemoveFromFavorites } = props;
  // store hooks
  const { sidebarCollapsed: isSidebarCollapsed } = useAppTheme();

  const { isMobile } = usePlatformOS();
  const { moveFavourite, getGroupedFavourites } = useFavourite();
  const { workspaceSlug } = useParams();
  // states
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [instruction, setInstruction] = useState<"DRAG_OVER" | "DRAG_BELOW" | undefined>(undefined);
  const [folderToRename, setFolderToRename] = useState<string | boolean | null>(null);
  // refs
  const actionSectionRef = useRef<HTMLDivElement | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  !favourite.children && getGroupedFavourites(workspaceSlug.toString(), favourite.id);

  const handleOnDrop = (source: string, destination: string) => {
    moveFavourite(workspaceSlug.toString(), source, {
      parent: destination,
    })
      .then((res) => {
        console.log(res, "res");
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Success!",
          message: "Favourite moved successfully.",
        });
      })
      .catch((err) => {
        console.log(err, "err");
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: "Failed to move favourite.",
        });
      });
  };

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    return combine(
      dropTargetForElements({
        element,
        getData: () => ({ type: "PARENT", id: favourite.id }),
        onDragEnter: () => {
          setIsDragging(true);
        },
        onDragLeave: () => {
          setIsDragging(false);
        },
        onDragStart: () => {
          setIsDragging(true);
        },
        onDrop: ({ self, source }) => {
          setIsDragging(false);
          const sourceId = source?.data?.id as string | undefined;
          const destinationId = self?.data?.id as string | undefined;

          if (sourceId === destinationId) return;
          if (!sourceId || !destinationId) return;

          handleOnDrop(sourceId, destinationId);
        },
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementRef.current, isDragging, favourite.id, handleOnDrop]);

  useOutsideClickDetector(actionSectionRef, () => setIsMenuActive(false));

  return folderToRename ? (
    <NewFavouriteFolder
      setCreateNewFolder={setFolderToRename}
      actionType="rename"
      defaultName={favourite.name}
      favouriteId={favourite.id}
    />
  ) : (
    <>
      <Disclosure key={`${favourite.id}`} ref={elementRef} defaultOpen={false}>
        {({ open }) => (
          <div
            // id={`sidebar-${projectId}-${projectListType}`}
            className={cn("relative", {
              "bg-custom-sidebar-background-80 opacity-60": isDragging,
            })}
          >
            <DropIndicator classNames="absolute top-0" isVisible={instruction === "DRAG_OVER"} />
            <div
              className={cn(
                "group/project-item relative w-full px-2 py-1.5 flex items-center rounded-md text-custom-sidebar-text-100 hover:bg-custom-sidebar-background-90",
                {
                  "bg-custom-sidebar-background-90": isMenuActive,
                  "p-0 size-8 aspect-square justify-center mx-auto": isSidebarCollapsed,
                }
              )}
            >
              {isSidebarCollapsed ? (
                <div
                  className={cn("flex-grow flex items-center gap-1.5 truncate text-left select-none", {
                    "justify-center": isSidebarCollapsed,
                  })}
                >
                  <Disclosure.Button as="button" className="size-8 aspect-square flex-shrink-0 grid place-items-center">
                    <div className="size-4 grid place-items-center flex-shrink-0">
                      <FavouriteFolderIcon />
                    </div>
                  </Disclosure.Button>
                </div>
              ) : (
                <>
                  <Tooltip
                    tooltipContent={`${favourite.name}`}
                    position="right"
                    disabled={!isSidebarCollapsed}
                    isMobile={isMobile}
                  >
                    <div className="flex-grow flex truncate">
                      <Disclosure.Button
                        as="button"
                        type="button"
                        className={cn("flex-grow flex items-center gap-1.5 text-left select-none w-full", {
                          "justify-center": isSidebarCollapsed,
                        })}
                      >
                        <div className="size-4 grid place-items-center flex-shrink-0">
                          <FavouriteFolderIcon />
                        </div>
                        <p className="truncate text-sm font-medium text-custom-sidebar-text-200">{favourite.name}</p>
                      </Disclosure.Button>
                    </div>
                  </Tooltip>
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
                    <CustomMenu.MenuItem onClick={() => handleRemoveFromFavorites(favourite)}>
                      <span className="flex items-center justify-start gap-2">
                        <Star className="h-3.5 w-3.5 fill-yellow-500 stroke-yellow-500" />
                        <span>Remove from favorites</span>
                      </span>
                    </CustomMenu.MenuItem>
                    <CustomMenu.MenuItem onClick={() => setFolderToRename(favourite.id)}>
                      <div className="flex items-center justify-start gap-2">
                        <PenSquare className="h-3.5 w-3.5 stroke-[1.5] text-custom-text-300" />
                        <span>Rename Folder</span>
                      </div>
                    </CustomMenu.MenuItem>
                  </CustomMenu>
                  <Disclosure.Button
                    as="button"
                    type="button"
                    className={cn(
                      "hidden group-hover/project-item:inline-block p-0.5 rounded hover:bg-custom-sidebar-background-80",
                      {
                        "inline-block": isMenuActive,
                      }
                    )}
                  >
                    <ChevronRight
                      className={cn("size-4 flex-shrink-0 text-custom-sidebar-text-400 transition-transform", {
                        "rotate-90": open,
                      })}
                    />
                  </Disclosure.Button>
                </>
              )}
            </div>
            {favourite.children && favourite.children.length > 0 && (
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel as="div" className="flex flex-col gap-0.5 mt-1 px-2">
                  {favourite.children.map((child) => (
                    <FavouriteItem
                      key={child.id}
                      favourite={child}
                      handleRemoveFromFavorites={handleRemoveFromFavorites}
                    />
                  ))}
                </Disclosure.Panel>
              </Transition>
            )}
            {isLastChild && <DropIndicator isVisible={instruction === "DRAG_BELOW"} />}
          </div>
        )}
      </Disclosure>
    </>
  );
};
