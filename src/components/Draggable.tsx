import { sidebarDnd } from "@/sidebarDnd";
import { Component } from "@/Simulation";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn, composeRefs } from "@/lib/utils";
import React from "react";
import { Slot } from "@radix-ui/react-slot";

const { useDraggable } = sidebarDnd;

interface InputData {
  type: "input";
}

interface OutputData {
  type: "output";
}

interface ComponentData {
  type: "chip";
  component: Component;
}

type DraggableProps = Omit<ButtonProps, "id"> & {
  id: string | number;
  data: InputData | OutputData | ComponentData;
  asChild?: boolean;
};

export const Draggable = React.forwardRef<HTMLButtonElement, DraggableProps>(
  ({ id, data, className, variant = "secondary", asChild, ...rest }, ref) => {
    const Comp = asChild ? Slot : Button;

    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id,
      data: {
        ...data,
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

    return (
      <Comp
        ref={composeRefs<HTMLButtonElement | null>(setNodeRef, ref)}
        variant={variant}
        className={cn(
          "transition-[box-shadow,opacity] cursor-grab hover:shadow-md",
          {
            "opacity-50 duration-0": isDragging,
            "duration-150": !isDragging,
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
