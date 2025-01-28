import { CSSProperties, HTMLAttributes } from "react";
import { sidebarDnd } from "./sidebarDnd";
import { Component } from "./Simulation";

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

type DraggableProps = HTMLAttributes<HTMLDivElement> & {
  id: string | number;
  data: InputData | OutputData | ComponentData;
};

export function Draggable({ id, data, ...rest }: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data,
    });
  const style: CSSProperties =
    isDragging && transform !== null
      ? {
          position: "absolute",
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          cursor: "grabbing",
        }
      : {
          cursor: "grab",
        };

  return (
    <>
      <div>
        <div
          ref={setNodeRef}
          style={style}
          {...listeners}
          {...attributes}
          {...rest}
        ></div>
        {isDragging && <div className="opacity-50" {...rest}></div>}
      </div>
    </>
  );
}
