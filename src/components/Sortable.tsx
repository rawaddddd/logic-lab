import React, { CSSProperties } from "react";
import { CSS } from "@dnd-kit/utilities";
import { Button, ButtonProps } from "./ui/button";
import { cn, composeRefs } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { ComponentDragData, sidebarDnd } from "@/sidebarDnd";

const { useSortable } = sidebarDnd;

type SortableProps = Omit<ButtonProps, "id"> & {
  id: string | number;
  data: ComponentDragData;
  noDrop?: boolean;
  asChild?: boolean;
  sortingDisabled?: boolean;
};

export const Sortable = React.forwardRef<HTMLButtonElement, SortableProps>(
  (
    {
      id,
      data,
      className,
      variant = "secondary",
      noDrop = false,
      asChild,
      sortingDisabled = false,
      ...rest
    },
    ref
  ) => {
    const Comp = asChild ? Slot : Button;

    const {
      attributes,
      listeners,
      setNodeRef,
      isDragging,
      isSorting,
      transform,
    } = useSortable({
      id,
      data: {
        ...data,
        noDrop,
        dragOverlay: (
          <Comp
            variant={variant}
            className={cn(className, "pointer-events-none")}
          >
            {rest.children}
          </Comp>
        ),
      },
    });

    const style: CSSProperties = {
      transform: sortingDisabled
        ? undefined
        : CSS.Transform.toString(transform),
    };

    return (
      <Comp
        ref={composeRefs<HTMLButtonElement | null>(setNodeRef, ref)}
        variant={variant}
        style={style}
        className={cn(
          "transition-[box-shadow,opacity] cursor-grab hover:shadow-md",
          {
            "opacity-50 duration-0": isDragging,
            "duration-150": !isDragging,
            "transition-transform": isSorting,
          },
          className
        )}
        {...listeners}
        {...attributes}
        {...rest}
      />
    );
  }
);
