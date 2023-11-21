"use client";
import React, { useState } from "react";
import { cn, getEditorClassNames, useEditor } from "@plane/editor-core";
import { DocumentEditorExtensions } from "./extensions";
import {
  IDuplicationConfig,
  IPageArchiveConfig,
  IPageLockConfig,
} from "./types/menu-actions";
import { EditorHeader } from "./components/editor-header";
import { useEditorMarkings } from "./hooks/use-editor-markings";
import { SummarySideBar } from "./components/summary-side-bar";
import { DocumentDetails } from "./types/editor-types";
import { PageRenderer } from "./components/page-renderer";
import { getMenuOptions } from "./utils/menu-options";
import { useRouter } from "next/router";

export type UploadImage = (file: File) => Promise<string>;
export type DeleteImage = (assetUrlWithWorkspaceId: string) => Promise<any>;

interface IDocumentEditor {
  documentDetails: DocumentDetails;
  value: string;
  uploadFile: UploadImage;
  deleteFile: DeleteImage;
  customClassName?: string;
  editorContentCustomClassNames?: string;
  onChange: (json: any, html: string) => void;
  setIsSubmitting?: (
    isSubmitting: "submitting" | "submitted" | "saved",
  ) => void;
  setShouldShowAlert?: (showAlert: boolean) => void;
  forwardedRef?: any;
  debouncedUpdatesEnabled?: boolean;
  duplicationConfig?: IDuplicationConfig;
  pageLockConfig?: IPageLockConfig;
  pageArchiveConfig?: IPageArchiveConfig;
}
interface DocumentEditorProps extends IDocumentEditor {
  forwardedRef?: React.Ref<EditorHandle>;
}

interface EditorHandle {
  clearEditor: () => void;
  setEditorValue: (content: string) => void;
}

export interface IMarking {
  type: "heading";
  level: number;
  text: string;
  sequence: number;
}

const DocumentEditor = ({
  documentDetails,
  onChange,
  debouncedUpdatesEnabled,
  setIsSubmitting,
  setShouldShowAlert,
  editorContentCustomClassNames,
  value,
  uploadFile,
  deleteFile,
  customClassName,
  forwardedRef,
  duplicationConfig,
  pageLockConfig,
  pageArchiveConfig,
}: IDocumentEditor) => {
  // const [alert, setAlert] = useState<string>("")
  const { markings, updateMarkings } = useEditorMarkings();
  const [sidePeekVisible, setSidePeekVisible] = useState(true);
  const router = useRouter();

  const editor = useEditor({
    onChange(json, html) {
      updateMarkings(json);
      onChange(json, html);
    },
    onStart(json) {
      updateMarkings(json);
    },
    debouncedUpdatesEnabled,
    setIsSubmitting,
    setShouldShowAlert,
    value,
    uploadFile,
    deleteFile,
    forwardedRef,
    extensions: DocumentEditorExtensions(uploadFile, setIsSubmitting),
  });

  if (!editor) {
    return null;
  }

  const KanbanMenuOptions = getMenuOptions({
    editor: editor,
    router: router,
    duplicationConfig: duplicationConfig,
    pageLockConfig: pageLockConfig,
    pageArchiveConfig: pageArchiveConfig,
  });
  const editorClassNames = getEditorClassNames({
    noBorder: true,
    borderOnFocus: false,
    customClassName,
  });

  if (!editor) return null;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <EditorHeader
        readonly={false}
        KanbanMenuOptions={KanbanMenuOptions}
        editor={editor}
        sidePeekVisible={sidePeekVisible}
        setSidePeekVisible={(val) => setSidePeekVisible(val)}
        markings={markings}
        uploadFile={uploadFile}
        setIsSubmitting={setIsSubmitting}
        isLocked={!pageLockConfig ? false : pageLockConfig.is_locked}
        isArchived={!pageArchiveConfig ? false : pageArchiveConfig.is_archived}
        archivedAt={pageArchiveConfig && pageArchiveConfig.archived_at}
        documentDetails={documentDetails}
      />
      <div className="h-full w-full flex overflow-hidden">
        <div className="flex-shrink-0 h-full w-80">
          <SummarySideBar
            editor={editor}
            markings={markings}
            sidePeekVisible={sidePeekVisible}
          />
        </div>
        <div className="h-full w-full">
          <PageRenderer
            editor={editor}
            editorContentCustomClassNames={editorContentCustomClassNames}
            editorClassNames={editorClassNames}
            documentDetails={documentDetails}
          />
        </div>
        {/* Page Element */}
      </div>
    </div>
  );
};

const DocumentEditorWithRef = React.forwardRef<EditorHandle, IDocumentEditor>(
  (props, ref) => <DocumentEditor {...props} forwardedRef={ref} />,
);

DocumentEditorWithRef.displayName = "DocumentEditorWithRef";

export { DocumentEditor, DocumentEditorWithRef };
