"use client";
import React, { FC } from "react";
import { observer } from "mobx-react";
// components
import { WidgetCollapsibleButton, IssueAttachmentActionButton } from "@/components/issues/issue-detail-widgets";
// hooks
import { useIssueDetail } from "@/hooks/store";

type Props = {
  isOpen: boolean;
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  disabled: boolean;
};

export const IssueAttachmentsCollapsibleTitle: FC<Props> = observer((props) => {
  const { isOpen, workspaceSlug, projectId, issueId, disabled } = props;
  // store hooks
  const {
    issue: { getIssueById },
  } = useIssueDetail();

  // derived values
  const issue = getIssueById(issueId);
  const attachmentCount = issue?.attachment_count ?? 0;

  // indicator element
  const indicatorElement = (
    <span className="flex items-center justify-center ">
      <p className="text-base text-custom-text-300 !leading-3">{attachmentCount}</p>
    </span>
  );

  return (
    <WidgetCollapsibleButton
      isOpen={isOpen}
      title="Attachments"
      indicatorElement={indicatorElement}
      actionItemElement={
        <IssueAttachmentActionButton
          workspaceSlug={workspaceSlug}
          projectId={projectId}
          issueId={issueId}
          disabled={disabled}
        />
      }
    />
  );
});
