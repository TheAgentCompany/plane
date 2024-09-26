import { insertImage } from "@/helpers/editor-commands";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";

export const DropHandlerExtension = () =>
  Extension.create({
    name: "dropHandler",
    priority: 1000,

    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey("drop-handler-plugin"),
          props: {
            handlePaste: (view: EditorView, event: ClipboardEvent) => {
              if (event.clipboardData && event.clipboardData.files && event.clipboardData.files.length > 0) {
                event.preventDefault();
                const files = Array.from(event.clipboardData.files);
                const imageFiles = files.filter((file) => file.type.startsWith("image"));

                if (imageFiles.length > 0) {
                  const pos = view.state.selection.from;
                  imageFiles.forEach((file, index) => {
                    insertImage({ editor: this.editor, event: "drop", pos: pos + index, file });
                  });
                  return true;
                }
              }
              return false;
            },
            handleDrop: (view: EditorView, event: DragEvent, _slice: any, moved: boolean) => {
              if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                event.preventDefault();
                const files = Array.from(event.dataTransfer.files);
                const imageFiles = files.filter((file) => file.type.startsWith("image"));

                if (imageFiles.length > 0) {
                  const coordinates = view.posAtCoords({
                    left: event.clientX,
                    top: event.clientY,
                  });

                  if (coordinates) {
                    imageFiles.forEach((file, index) => {
                      setTimeout(() => {
                        insertImage({ editor: this.editor, event: "drop", pos: coordinates.pos + index, file });
                      }, index * 100); // Slight delay between insertions
                    });
                  }
                  return true;
                }
              }
              return false;
            },
          },
        }),
      ];
    },
  });
