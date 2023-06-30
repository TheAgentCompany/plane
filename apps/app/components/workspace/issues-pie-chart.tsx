// ui
import { PieGraph } from "components/ui";
// helpers
import { capitalizeFirstLetter } from "helpers/string.helper";
// types
import { IUserStateDistribution } from "types";
// constants
import { STATE_GROUP_COLORS } from "constants/state";
// hooks
import useWindowWidth from "hooks/use-window-width";

type Props = {
  groupedIssues: IUserStateDistribution[] | undefined;
};

export const IssuesPieChart: React.FC<Props> = ({ groupedIssues }) => {
  const { IS_SMALL_SCREEN } = useWindowWidth();

  return (
    <div>
      <h3 className="mb-2 font-semibold">Issues by States</h3>
      <div className="rounded-[10px] border border-brand-base bg-brand-base p-4">
        <PieGraph
          data={
            groupedIssues?.map((cell) => ({
              id: cell.state_group,
              label: cell.state_group,
              value: cell.state_count,
              color: STATE_GROUP_COLORS[cell.state_group.toLowerCase()],
            })) ?? []
          }
          height="320px"
          innerRadius={0.6}
          cornerRadius={5}
          padAngle={2}
          enableArcLabels
          arcLabelsTextColor="#000000"
          enableArcLinkLabels={false}
          legends={[
            {
              anchor: IS_SMALL_SCREEN ? "bottom-left" : "right",
              direction: "column",
              justify: false,
              translateX: IS_SMALL_SCREEN ? -40 : 0,
              translateY: IS_SMALL_SCREEN ? 40 : 56,
              itemsSpacing: IS_SMALL_SCREEN ? 5 : 10,
              itemWidth: 100,
              itemHeight: 18,
              itemTextColor: "rgb(var(--color-text-secondary))",
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 12,
              symbolShape: "square",
              data:
                groupedIssues?.map((cell) => ({
                  id: cell.state_group,
                  label: capitalizeFirstLetter(cell.state_group),
                  value: cell.state_count,
                  color: STATE_GROUP_COLORS[cell.state_group.toLowerCase()],
                })) ?? [],
            },
          ]}
          activeInnerRadiusOffset={5}
          colors={(datum) => datum.data.color}
          tooltip={(datum) => (
            <div className="flex items-center gap-2 rounded-md border border-brand-base bg-brand-surface-2 p-2 text-xs">
              <span className="text-brand-secondary capitalize">{datum.datum.label} issues:</span>{" "}
              {datum.datum.value}
            </div>
          )}
          {...(IS_SMALL_SCREEN && { margin: { top: 0 } })}
          theme={{
            background: "transparent",
          }}
        />
      </div>
    </div>
  );
};
