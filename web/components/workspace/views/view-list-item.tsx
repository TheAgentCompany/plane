import { useRouter } from "next/router";
import Link from "next/link";
import { observer } from "mobx-react-lite";
import { useState } from "react";

// components
import { DeleteGlobalViewModal } from "components/workspace";
// ui
import { CustomMenu } from "components/ui";
// icons
import { PencilIcon, Sparkles, TrashIcon } from "lucide-react";
// helpers
import { truncateText } from "helpers/string.helper";
// types
import { IWorkspaceView } from "types/workspace-views";

type Props = { view: IWorkspaceView };

export const GlobalViewListItem: React.FC<Props> = observer((props) => {
  const { view } = props;

  const [deleteViewModal, setDeleteViewModal] = useState(false);

  const router = useRouter();
  const { workspaceSlug } = router.query;

  return (
    <>
      <DeleteGlobalViewModal data={view} isOpen={deleteViewModal} onClose={() => setDeleteViewModal(false)} />
      <div className="group hover:bg-custom-background-90 border-b border-custom-border-200">
        <Link href={`/${workspaceSlug}/workspace-views/${view.id}`}>
          <a className="flex items-center justify-between relative rounded px-5 py-4 w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="grid place-items-center h-10 w-10 rounded bg-custom-background-90 group-hover:bg-custom-background-100">
                  <Sparkles size={14} strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <p className="truncate text-sm leading-4 font-medium">{truncateText(view.name, 75)}</p>
                  {view?.description && <p className="text-xs text-custom-text-200">{view.description}</p>}
                </div>
              </div>
              <div className="ml-2 flex flex-shrink-0">
                <div className="flex items-center gap-4">
                  <p className="rounded bg-custom-background-80 py-1 px-2 text-xs text-custom-text-200 opacity-0 group-hover:opacity-100">
                    {view.query_data.filters && Object.keys(view.query_data.filters).length > 0
                      ? `${Object.keys(view.query_data.filters)
                          .map((key: string) =>
                            view.query_data.filters[key as keyof typeof view.query_data.filters] !== null
                              ? isNaN(
                                  (view.query_data.filters[key as keyof typeof view.query_data.filters] as any).length
                                )
                                ? 0
                                : (view.query_data.filters[key as keyof typeof view.query_data.filters] as any).length
                              : 0
                          )
                          .reduce((curr, prev) => curr + prev, 0)} filters`
                      : "0 filters"}
                  </p>
                  <CustomMenu width="auto" ellipsis>
                    <CustomMenu.MenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <span className="flex items-center justify-start gap-2">
                        <PencilIcon size={14} strokeWidth={2} />
                        <span>Edit View</span>
                      </span>
                    </CustomMenu.MenuItem>
                    <CustomMenu.MenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteViewModal(true);
                      }}
                    >
                      <span className="flex items-center justify-start gap-2">
                        <TrashIcon size={14} strokeWidth={2} />
                        <span>Delete View</span>
                      </span>
                    </CustomMenu.MenuItem>
                  </CustomMenu>
                </div>
              </div>
            </div>
          </a>
        </Link>
      </div>
    </>
  );
});
