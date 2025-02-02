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
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data,
  });

  return (
    <div>
      <Button
        ref={setNodeRef}
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
      ></Button>
    </div>
  );
}
