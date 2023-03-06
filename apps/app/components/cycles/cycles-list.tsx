import { useState } from "react";

// components
import { DeleteCycleModal, SingleCycleCard } from "components/cycles";
// icons
import { CompletedCycleIcon, CurrentCycleIcon, UpcomingCycleIcon } from "components/icons";
// types
import { ICycle, SelectCycleType } from "types";
import { Loader } from "components/ui";

type TCycleStatsViewProps = {
  cycles: ICycle[] | undefined;
  setCreateUpdateCycleModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedCycle: React.Dispatch<React.SetStateAction<SelectCycleType>>;
  type: "current" | "upcoming" | "draft";
};

export const CyclesList: React.FC<TCycleStatsViewProps> = ({
  cycles,
  setCreateUpdateCycleModal,
  setSelectedCycle,
  type,
}) => {
  const [cycleDeleteModal, setCycleDeleteModal] = useState(false);
  const [selectedCycleForDelete, setSelectedCycleForDelete] = useState<SelectCycleType>();

  const handleDeleteCycle = (cycle: ICycle) => {
    setSelectedCycleForDelete({ ...cycle, actionType: "delete" });
    setCycleDeleteModal(true);
  };

  const handleEditCycle = (cycle: ICycle) => {
    setSelectedCycle({ ...cycle, actionType: "edit" });
    setCreateUpdateCycleModal(true);
  };

  return (
    <>
      <DeleteCycleModal
        isOpen={
          cycleDeleteModal &&
          !!selectedCycleForDelete &&
          selectedCycleForDelete.actionType === "delete"
        }
        setIsOpen={setCycleDeleteModal}
        data={selectedCycleForDelete}
      />
      {cycles ? (
        cycles.length > 0 ? (
          <div className="grid grid-cols-1 gap-9 md:grid-cols-2 lg:grid-cols-3">
            {cycles.map((cycle) => (
              <SingleCycleCard
                key={cycle.id}
                cycle={cycle}
                handleDeleteCycle={() => handleDeleteCycle(cycle)}
                handleEditCycle={() => handleEditCycle(cycle)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            {type === "upcoming" ? (
              <UpcomingCycleIcon height="56" width="56" />
            ) : type === "draft" ? (
              <CompletedCycleIcon height="56" width="56" />
            ) : (
              <CurrentCycleIcon height="56" width="56" />
            )}
            <h3 className="text-gray-500">
              No {type} {type === "current" ? "cycle" : "cycles"} yet. Create with{" "}
              <pre className="inline rounded bg-gray-200 px-2 py-1">Q</pre>.
            </h3>
          </div>
        )
      ) : (
        <Loader className="grid grid-cols-1 gap-9 md:grid-cols-2 lg:grid-cols-3">
          <Loader.Item height="300px" />
        </Loader>
      )}
    </>
  );
};
