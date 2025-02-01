import { CSSProperties } from "react";
import { sidebarDnd } from "@/sidebarDnd";
import { Component } from "@/Simulation";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

type DraggableProps = ButtonProps & {
  id: string | number;
  data: InputData | OutputData | ComponentData;
};

export function Draggable({
  id,
  data,
  className,
  variant = "secondary",
  ...rest
}: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data,
    });
  const style: CSSProperties =
    isDragging && transform !== null
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : {};

  return (
    <>
      <div>
        <Button
          ref={setNodeRef}
          style={style}
          variant={variant}
          className={cn(
            "transition-shadow z-50",
            {
              "absolute shadow-lg cursor-grabbing": isDragging,
              "hover:shadow-md cursor-grab": !isDragging,
            },
            className
          )}
          {...listeners}
          {...attributes}
          {...rest}
        ></Button>
        {isDragging && (
          <Button
            variant={variant}
            className={cn("opacity-50 pointer-events-none", className)}
            {...rest}
          ></Button>
        )}
      </div>
    </>
  );
}
