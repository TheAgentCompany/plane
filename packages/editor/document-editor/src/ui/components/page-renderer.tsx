import { useCallback, useRef, useState } from "react";
import { EditorContainer, EditorContentWrapper } from "@plane/editor-core";
import { Node } from "@tiptap/pm/model";
import { EditorView } from "@tiptap/pm/view";
import { Editor, ReactRenderer } from "@tiptap/react";
import { LinkView, LinkViewProps } from "./links/link-view";
import {
  autoUpdate,
  computePosition,
  flip,
  hide,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import BlockMenu from "../menu//block-menu";
// ui
import { TextArea } from "@plane/ui";

type IPageRenderer = {
  title: string;
  updatePageTitle: (title: string) => void;
  editor: Editor;
  editorContainerClassName: string;
  hideDragHandle?: () => void;
  readonly: boolean;
  tabIndex?: number;
};

export const PageRenderer = (props: IPageRenderer) => {
  const { title, tabIndex, editor, hideDragHandle, editorContainerClassName, updatePageTitle, readonly } = props;
  // states
  const [linkViewProps, setLinkViewProps] = useState<LinkViewProps>();
  const [isOpen, setIsOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<{ x: number; y: number }>();
  const [cleanup, setCleanup] = useState(() => () => {});

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [flip(), shift(), hide({ strategy: "referenceHidden" })],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context, {
    ancestorScroll: true,
  });

  const { getFloatingProps } = useInteractions([dismiss]);

  const handlePageTitleChange = (title: string) => updatePageTitle(title);

  const floatingElementRef = useRef<HTMLElement | null>(null);

  const closeLinkView = () => setIsOpen(false);

  const handleLinkHover = useCallback(
    (event: React.MouseEvent) => {
      if (!editor) return;
      const target = event.target as HTMLElement;
      const view = editor.view as EditorView;

      if (!target || !view) return;
      const pos = view.posAtDOM(target, 0);
      if (!pos || pos < 0) return;

      if (target.nodeName !== "A") return;

      const node = view.state.doc.nodeAt(pos) as Node;
      if (!node || !node.isAtom) return;

      // we need to check if any of the marks are links
      const marks = node.marks;

      if (!marks) return;

      const linkMark = marks.find((mark) => mark.type.name === "link");

      if (!linkMark) return;

      if (floatingElementRef.current) {
        floatingElementRef.current?.remove();
      }

      if (cleanup) cleanup();

      const href = linkMark.attrs.href;
      const componentLink = new ReactRenderer(LinkView, {
        props: {
          view: "LinkPreview",
          url: href,
          editor: editor,
          from: pos,
          to: pos + node.nodeSize,
        },
        editor,
      });

      const referenceElement = target as HTMLElement;
      const floatingElement = componentLink.element as HTMLElement;

      floatingElementRef.current = floatingElement;

      const cleanupFunc = autoUpdate(referenceElement, floatingElement, () => {
        computePosition(referenceElement, floatingElement, {
          placement: "bottom",
          middleware: [
            flip(),
            shift(),
            hide({
              strategy: "referenceHidden",
            }),
          ],
        }).then(({ x, y }) => {
          setCoordinates({ x: x - 300, y: y - 50 });
          setIsOpen(true);
          setLinkViewProps({
            closeLinkView: closeLinkView,
            view: "LinkPreview",
            url: href,
            editor: editor,
            from: pos,
            to: pos + node.nodeSize,
          });
        });
      });

      setCleanup(cleanupFunc);
    },
    [editor, cleanup]
  );

  return (
    <div className="frame-renderer h-full w-full flex flex-col gap-y-7 overflow-y-auto overflow-x-hidden">
      <div className="w-full flex-shrink-0 ml-5">
        {readonly ? (
          <h6 className="-mt-2 break-words bg-transparent text-4xl font-bold">{title}</h6>
        ) : (
          <TextArea
            onChange={(e) => handlePageTitleChange(e.target.value)}
            className="-mt-2 w-full bg-custom-background text-4xl font-bold outline-none p-0 border-none resize-none rounded-none"
            style={{
              lineHeight: "1.2",
            }}
            placeholder="Untitled Page"
            onKeyDown={(e) => {
              console.log("event", e);
              if (e.key === "Enter") {
                e.preventDefault();
                editor
                  .chain()
                  .insertContentAt(0, [{ type: "paragraph" }])
                  .focus()
                  .run();
              }
            }}
            value={title}
          />
        )}
      </div>
      <div className="flex-grow w-full -mx-5" onMouseOver={handleLinkHover}>
        <EditorContainer
          editor={editor}
          hideDragHandle={hideDragHandle}
          editorContainerClassName={editorContainerClassName}
        >
          <EditorContentWrapper tabIndex={tabIndex} editor={editor} />
          {editor && editor.isEditable && <BlockMenu editor={editor} />}
        </EditorContainer>
      </div>
      {isOpen && linkViewProps && coordinates && (
        <div
          style={{ ...floatingStyles, left: `${coordinates.x}px`, top: `${coordinates.y}px` }}
          className="absolute"
          ref={refs.setFloating}
        >
          <LinkView {...linkViewProps} style={floatingStyles} {...getFloatingProps()} />
        </div>
      )}
    </div>
  );
};
