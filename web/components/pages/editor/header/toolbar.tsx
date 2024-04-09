import React, { useEffect, useState, useCallback } from "react";
// editor
import { EditorRefApi } from "@plane/document-editor";
import { EditorMenuItemNames } from "@plane/editor-document-core";
// ui
import { Tooltip } from "@plane/ui";
// constants
import { TOOLBAR_ITEMS, ToolbarMenuItem } from "@/constants/editor";
// helpers
import { cn } from "@/helpers/common.helper";

type Props = {
  editorRef: EditorRefApi;
};

type ToolbarButtonProps = {
  item: ToolbarMenuItem;
  isActive: boolean;
  executeCommand: (commandName: EditorMenuItemNames) => void;
};

const ToolbarButton: React.FC<ToolbarButtonProps> = React.memo((props) => {
  const { item, isActive, executeCommand } = props;

  return (
    <Tooltip
      tooltipContent={
        <p className="flex flex-col gap-1 text-center text-xs">
          <span className="font-medium">{item.name}</span>
          {item.shortcut && <kbd className="text-custom-text-400">{item.shortcut.join(" + ")}</kbd>}
        </p>
      }
    >
      <button
        key={item.key}
        type="button"
        onClick={() => executeCommand(item.key)}
        className={cn("grid h-7 w-7 place-items-center rounded text-custom-text-300 hover:bg-custom-background-80", {
          "bg-custom-background-80 text-custom-text-100": isActive,
        })}
      >
        <item.icon
          className={cn("h-4 w-4", {
            "text-custom-text-100": isActive,
          })}
        />
      </button>
    </Tooltip>
  );
});

ToolbarButton.displayName = "ToolbarButton";

const toolbarItems = TOOLBAR_ITEMS.document;

export const PageToolbar: React.FC<Props> = ({ editorRef }) => {
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});

  const updateActiveStates = useCallback(() => {
    const newActiveStates: Record<string, boolean> = {};
    Object.values(toolbarItems)
      .flat()
      .forEach((item) => {
        newActiveStates[item.key] = editorRef.isMenuItemActive(item.key);
      });
    setActiveStates(newActiveStates);
  }, [editorRef]);

  useEffect(() => {
    const unsubscribe = editorRef.onStateChange(updateActiveStates);
    updateActiveStates();
    return () => unsubscribe();
  }, [editorRef, updateActiveStates]);

  return (
    <div className="flex flex-wrap items-center divide-x divide-custom-border-200">
      {Object.keys(toolbarItems).map((key) => (
        <div key={key} className="flex items-center gap-0.5 px-2 first:pl-0 last:pr-0">
          {toolbarItems[key].map((item) => (
            <ToolbarButton
              key={item.key}
              item={item}
              isActive={activeStates[item.key]}
              executeCommand={editorRef.executeMenuItemCommand}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
