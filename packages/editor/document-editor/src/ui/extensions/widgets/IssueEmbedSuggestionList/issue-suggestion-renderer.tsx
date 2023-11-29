import { cn } from "@plane/editor-core";
import { Editor } from "@tiptap/core";
import tippy from "tippy.js";
import { ReactRenderer } from "@tiptap/react";
import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PriorityIcon } from "@plane/ui";

const updateScrollView = (container: HTMLElement, item: HTMLElement) => {
  const containerHeight = container.offsetHeight;
  const itemHeight = item ? item.offsetHeight : 0;

  const top = item.offsetTop;
  const bottom = top + itemHeight;

  if (top < container.scrollTop) {
    // container.scrollTop = top - containerHeight;
    item.scrollIntoView({
			behavior: "smooth",
			block: "center"
    })
  } else if (bottom > containerHeight + container.scrollTop) {
    // container.scrollTop = bottom - containerHeight;
    item.scrollIntoView({
			behavior: "smooth",
			block: "center",
    })
  }
};
interface IssueSuggestionProps {
  title: string;
  priority: "high" | "low" | "medium" | "urgent" | "none",
  state: "Cancelled" | "In Progress" | "Todo" | "Done" | "Backlog",
  identifier: string;
}

const IssueSuggestionList = ({
  items,
  command,
}: {
  items: IssueSuggestionProps[];
  command: any;
  editor: any;
  range: any;
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<string>("Backlog");
  const sections = ["Backlog", "In Progress", "Todo", "Done", "Cancelled"];
  const [displayedItems, setDisplayedItems] = useState<{ [key: string]: IssueSuggestionProps[] }>({});

  useEffect(() => {
    let newDisplayedItems: { [key: string]: IssueSuggestionProps[] } = {};
    sections.forEach(section => {
      newDisplayedItems[section] = items.filter(item => item.state === section).slice(0, 5);
    });
    setDisplayedItems(newDisplayedItems);
  }, [items]);

  const selectItem = useCallback(
    (index: number) => {
      const item = displayedItems[currentSection][index];
      if (item) {
        command(item);
      }
    },
    [command, displayedItems, currentSection],
  );

  useEffect(() => {
    const navigationKeys = ["ArrowUp", "ArrowDown", "Enter", "Tab"];
    const onKeyDown = (e: KeyboardEvent) => {
      if (navigationKeys.includes(e.key)) {
        e.preventDefault();
        if (e.key === "ArrowUp") {
          setSelectedIndex((selectedIndex + displayedItems[currentSection].length - 1) % displayedItems[currentSection].length);
          return true;
        }
        if (e.key === "ArrowDown") {
          const nextIndex = (selectedIndex + 1) % displayedItems[currentSection].length;
          setSelectedIndex(nextIndex);
          if (nextIndex === 4) {
            const nextItems = items.filter(item => item.state === currentSection).slice(displayedItems[currentSection].length, displayedItems[currentSection].length + 5);
            setDisplayedItems(prevItems => ({ ...prevItems, [currentSection]: [...prevItems[currentSection], ...nextItems] }));
          }
          return true;
        }
        if (e.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        if (e.key === "Tab") {
          const currentSectionIndex = sections.indexOf(currentSection);
          const nextSectionIndex = (currentSectionIndex + 1) % sections.length;
          setCurrentSection(sections[nextSectionIndex]);
          setSelectedIndex(0);
          return true;
        }
        return false;
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [displayedItems, selectedIndex, setSelectedIndex, selectItem, currentSection]);
  const commandListContainer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = commandListContainer?.current;
    if (container) {
      const sectionContainer = container?.querySelector(`#${currentSection}-container`) as HTMLDivElement;
      if (sectionContainer) {
        updateScrollView(container, sectionContainer)
      }
      const sectionScrollContainer = container?.querySelector(`#${currentSection}`) as HTMLElement;
      const item = sectionScrollContainer?.children[selectedIndex] as HTMLElement;
      if (item && sectionScrollContainer) {
        updateScrollView(sectionScrollContainer, item)
      }
    }
  }, [selectedIndex, currentSection]);

  return (
    <div
      id="issue-list-container"
      ref={commandListContainer}
      className="z-50 fixed h-auto max-h-[330px] w-[600px] overflow-y-auto overflow-x-hidden rounded-md border border-custom-border-300 bg-custom-background-100 px-1 py-2 shadow-md transition-all"
    >
      {sections.map((section) => {
        const sectionItems = displayedItems[section];
        return sectionItems && sectionItems.length > 0 ? (
          <div id={`${section}-container`}>
            <p className={"sticky text-xs --color-text-300 p-2"}>{section}</p>
            <div key={section} id={section} className={"max-h-[140px] overflow-y-scroll"}>
              {sectionItems.map((item: IssueSuggestionProps, index: number) => (
                <button
                  className={cn(
                    `flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm text-custom-text-200 hover:bg-custom-primary-100/5 hover:text-custom-text-100`,
                    {
                      "bg-custom-primary-100/5  text-custom-text-100":
                        section === currentSection && index === selectedIndex,
                    },
                  )}
                  key={index}
                  onClick={() => selectItem(index)}
                >

                  <h5 className="text-xs text-custom-text-300 whitespace-nowrap">
                    {item.identifier}
                  </h5>
                  <PriorityIcon priority={item.priority} />
                  <div>
                    <p className="font-medium whitespace-nowrap">{item.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null;
      })}
    </div>
  );
}

export const IssueListRenderer = () => {
  let component: ReactRenderer | null = null;
  let popup: any | null = null;

  return {
    onStart: (props: { editor: Editor; clientRect: DOMRect }) => {
      component = new ReactRenderer(IssueSuggestionList, {
        props,
        // @ts-ignore
        editor: props.editor,
      });

      // @ts-ignore
      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.querySelector("#editor-container"),
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "right",
      });
    },
    onUpdate: (props: { editor: Editor; clientRect: DOMRect }) => {
      component?.updateProps(props);

      popup &&
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
    },
    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === "Escape") {
        popup?.[0].hide();

        return true;
      }

      // @ts-ignore
      return component?.ref?.onKeyDown(props);
    },
    onExit: () => {
      popup?.[0].destroy();
      component?.destroy();
    },
  };
};

