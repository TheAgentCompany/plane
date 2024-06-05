import { observer } from "mobx-react";
// components
import { BulkOperationsUpgradeBanner } from "@/components/issues";
// hooks
import { useMultipleSelectStore } from "@/hooks/store";
import { TSelectionHelper } from "@/hooks/use-multiple-select";

type Props = {
  className?: string;
  selectionHelpers: TSelectionHelper;
};

export const IssueBulkOperationsRoot: React.FC<Props> = observer((props) => {
  const { className } = props;
  // store hooks
  const { isSelectionActive } = useMultipleSelectStore();

  if (!isSelectionActive) return null;

  return <BulkOperationsUpgradeBanner className={className} />;
});
