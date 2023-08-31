import { useEffect } from "react";
import { observer } from "mobx-react-lite";
// lib
import { useMobxStore } from "lib/mobx/store-provider";
// components
import {
  PeekOverviewHeader,
  PeekOverviewIssueActivity,
  PeekOverviewIssueDetails,
  PeekOverviewIssueProperties,
} from "components/issues/peek-overview";
// types
import { IIssue } from "types/issue";

type Props = {
  handleClose: () => void;
  issueDetails: IIssue;
};

export const FullScreenPeekView: React.FC<Props> = observer((props) => {
  const { handleClose, issueDetails } = props;

  const { issueDetails: issueDetailStore } = useMobxStore();

  return (
    <div className="h-full w-full grid grid-cols-10 divide-x divide-custom-border-200 overflow-hidden">
      <div className="h-full w-full flex flex-col col-span-7 overflow-hidden">
        <div className="w-full p-5">
          <PeekOverviewHeader handleClose={handleClose} issueDetails={issueDetails} />
        </div>
        <div className="h-full w-full px-6 overflow-y-auto">
          {/* issue title and description */}
          <div className="w-full">
            <PeekOverviewIssueDetails issueDetails={issueDetails} />
          </div>
          {/* divider */}
          <div className="h-[1] w-full border-t border-custom-border-200 my-5" />
          {/* issue activity/comments */}
          <div className="w-full">
            <PeekOverviewIssueActivity issueDetails={issueDetails} />
          </div>
        </div>
      </div>
      <div className="col-span-3 h-full w-full overflow-y-auto">
        {/* issue properties */}
        <div className="w-full px-6 py-5">
          <PeekOverviewIssueProperties issueDetails={issueDetails} mode="full" />
        </div>
      </div>
    </div>
  );
});
