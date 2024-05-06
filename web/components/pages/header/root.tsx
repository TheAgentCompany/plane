import { useCallback } from "react";
import isEmpty from "lodash/isEmpty";
import { observer } from "mobx-react";
import { ListFilter } from "lucide-react";
import { TPageFilterProps, TPageNavigationTabs } from "@plane/types";
// components
import { FiltersDropdown } from "@/components/issues";
import {
  PageAppliedFiltersList,
  PageFiltersSelection,
  PageOrderByDropdown,
  PageSearchInput,
  PageTabNavigation,
} from "@/components/pages";
// helpers
import { calculateTotalFilters } from "@/helpers/filter.helper";
// hooks
import { useMember, useProjectPages } from "@/hooks/store";

type Props = {
  pageType: TPageNavigationTabs;
  projectId: string;
  workspaceSlug: string;
};

export const PagesListHeaderRoot: React.FC<Props> = observer((props) => {
  const { pageType, projectId, workspaceSlug } = props;
  // store hooks
  const { filters, updateFilters, clearAllFilters } = useProjectPages(projectId);
  const {
    workspace: { workspaceMemberIds },
  } = useMember();

  const handleRemoveFilter = useCallback(
    (key: keyof TPageFilterProps, value: string | null) => {
      let newValues = filters.filters?.[key];

      if (key === "favorites") newValues = !!value;
      if (Array.isArray(newValues)) {
        if (!value) newValues = [];
        else newValues = newValues.filter((val) => val !== value);
      }

      updateFilters("filters", { [key]: newValues });
    },
    [filters.filters, updateFilters]
  );

  const appliedFilters: { [key: string]: string[] | boolean | null | undefined } = {};
  Object.entries(filters?.filters ?? {}).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value) && value.length === 0) return;

    appliedFilters[key] = Array.isArray(value) ? value : [String(value)];
  });

  return (
    <>
      <div className="flex-shrink-0 h-[50px] w-full border-b border-custom-border-200 px-6 relative flex items-center gap-4 justify-between">
        <PageTabNavigation workspaceSlug={workspaceSlug} projectId={projectId} pageType={pageType} />
        <div className="h-full flex items-center gap-2 self-end">
          <PageSearchInput projectId={projectId} />
          <PageOrderByDropdown
            sortBy={filters.sortBy}
            sortKey={filters.sortKey}
            onChange={(val) => {
              if (val.key) updateFilters("sortKey", val.key);
              if (val.order) updateFilters("sortBy", val.order);
            }}
          />
          <FiltersDropdown
            icon={<ListFilter className="h-3 w-3" />}
            title="Filters"
            placement="bottom-end"
            isFiltersApplied={!isEmpty(appliedFilters)}
          >
            <PageFiltersSelection
              filters={filters}
              handleFiltersUpdate={updateFilters}
              memberIds={workspaceMemberIds ?? undefined}
            />
          </FiltersDropdown>
        </div>
      </div>
      {calculateTotalFilters(filters?.filters ?? {}) !== 0 && (
        <div className="border-b border-custom-border-200 px-5 py-3">
          <PageAppliedFiltersList
            appliedFilters={filters.filters ?? {}}
            handleClearAllFilters={clearAllFilters}
            handleRemoveFilter={handleRemoveFilter}
            alwaysAllowEditing
          />
        </div>
      )}
    </>
  );
});
