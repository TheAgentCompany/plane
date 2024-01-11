import { useContext } from "react";
// mobx store
import { StoreContext } from "contexts/store-context";
// types
import { IPageStore } from "store/page.store";

export const useProjectSpecificPages = (projectId: string): IPageStore[] => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("usePage must be used within StoreProvider");
  return context.projectPages.projectPages[projectId];
};
