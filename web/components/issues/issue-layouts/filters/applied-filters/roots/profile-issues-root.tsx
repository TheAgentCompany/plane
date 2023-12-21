import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
// hooks
import { useIssues, useLabel } from "hooks/store";
// components
import { AppliedFiltersList } from "components/issues";
// types
import { IIssueFilterOptions } from "types";
import { EIssueFilterType, EIssuesStoreType } from "constants/issue";

export const ProfileIssuesAppliedFiltersRoot: React.FC = observer(() => {
  // router
  const router = useRouter();
  const { workspaceSlug } = router.query as {
    workspaceSlug: string;
  };
  // store hooks
  const {
    issuesFilter: { issueFilters, updateFilters },
  } = useIssues(EIssuesStoreType.PROFILE);

  const {
    workspace: { workspaceLabels },
  } = useLabel();
  // derived values
  const userFilters = issueFilters?.filters;

  // filters whose value not null or empty array
  const appliedFilters: IIssueFilterOptions = {};
  Object.entries(userFilters ?? {}).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value) && value.length === 0) return;
    appliedFilters[key as keyof IIssueFilterOptions] = value;
  });

  const handleRemoveFilter = (key: keyof IIssueFilterOptions, value: string | null) => {
    if (!workspaceSlug) return;
    if (!value) {
      updateFilters(workspaceSlug, EIssueFilterType.FILTERS, { [key]: null });
      return;
    }

    let newValues = issueFilters?.filters?.[key] ?? [];
    newValues = newValues.filter((val) => val !== value);

    updateFilters(workspaceSlug, EIssueFilterType.FILTERS, {
      [key]: newValues,
    });
  };

  const handleClearAllFilters = () => {
    if (!workspaceSlug) return;
    const newFilters: IIssueFilterOptions = {};
    Object.keys(userFilters ?? {}).forEach((key) => {
      newFilters[key as keyof IIssueFilterOptions] = null;
    });
    updateFilters(workspaceSlug, EIssueFilterType.FILTERS, { ...newFilters });
  };

  // return if no filters are applied
  if (Object.keys(appliedFilters).length === 0) return null;

  return (
    <div className="p-4">
      <AppliedFiltersList
        appliedFilters={appliedFilters}
        handleClearAllFilters={handleClearAllFilters}
        handleRemoveFilter={handleRemoveFilter}
        labels={workspaceLabels ?? []}
        states={[]}
      />
    </div>
  );
});
