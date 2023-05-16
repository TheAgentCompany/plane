// components
import { Loader, CalendarGraph } from "components/ui";
// types
import { IUserWorkspaceDashboard } from "types";
// constants
import { CHARTS_THEME } from "constants/graph";

type Props = {
  data: IUserWorkspaceDashboard | undefined;
};

export const IssuesStats: React.FC<Props> = ({ data }) => (
  <div className="grid grid-cols-1 rounded-[10px] border border-brand-base bg-brand-base lg:grid-cols-3">
    <div className="grid grid-cols-1 divide-y divide-brand-base border-b border-brand-base lg:border-r lg:border-b-0">
      <div className="flex">
        <div className="basis-1/2 p-4">
          <h4 className="text-sm">Issues assigned to you</h4>
          <h5 className="mt-2 text-2xl font-semibold">
            {data ? (
              data.assigned_issues_count
            ) : (
              <Loader>
                <Loader.Item height="25px" width="50%" />
              </Loader>
            )}
          </h5>
        </div>
        <div className="basis-1/2 border-l border-brand-base p-4">
          <h4 className="text-sm">Pending issues</h4>
          <h5 className="mt-2 text-2xl font-semibold">
            {data ? (
              data.pending_issues_count
            ) : (
              <Loader>
                <Loader.Item height="25px" width="50%" />
              </Loader>
            )}
          </h5>
        </div>
      </div>
      <div className="flex">
        <div className="basis-1/2 p-4">
          <h4 className="text-sm">Completed issues</h4>
          <h5 className="mt-2 text-2xl font-semibold">
            {data ? (
              data.completed_issues_count
            ) : (
              <Loader>
                <Loader.Item height="25px" width="50%" />
              </Loader>
            )}
          </h5>
        </div>
        <div className="basis-1/2 border-l border-brand-base p-4">
          <h4 className="text-sm">Issues due by this week</h4>
          <h5 className="mt-2 text-2xl font-semibold">
            {data ? (
              data.issues_due_week_count
            ) : (
              <Loader>
                <Loader.Item height="25px" width="50%" />
              </Loader>
            )}
          </h5>
        </div>
      </div>
    </div>
    <div className="p-4 lg:col-span-2">
      <h3 className="mb-2 font-semibold capitalize">Activity Graph</h3>
      <CalendarGraph
        data={
          data?.issue_activities.map((activity) => ({
            day: activity.created_date,
            value: activity.activity_count,
          })) ?? []
        }
        from={data?.issue_activities.length ? data.issue_activities[0].created_date : new Date()}
        to={
          data?.issue_activities.length
            ? data.issue_activities[data.issue_activities.length - 1].created_date
            : new Date()
        }
        height="200px"
        margin={{ bottom: 0, left: 10, right: 10, top: 0 }}
        theme={{
          ...CHARTS_THEME,
          background: "rgb(var(--color-bg-base))",
        }}
      />
    </div>
  </div>
);
