import {
  Active,
  CancelDrop,
  Collision,
  CollisionDetection as OriginalCollisionDetection,
  DndContext as OriginalDndContext,
  DndContextProps,
  DragCancelEvent as OriginalDragCancelEvent,
  DragEndEvent as OriginalDragEndEvent,
  DragMoveEvent as OriginalDragMoveEvent,
  DragOverEvent as OriginalDragOverEvent,
  DragStartEvent as OriginalDragStartEvent,
  DroppableContainer as OriginalDroppableContainer,
  Over,
  useDndMonitor as baseUseDndMonitor,
  useDraggable as baseUseDraggable,
  UseDraggableArguments,
  useDroppable as baseUseDroppable,
  UseDroppableArguments,
} from "@dnd-kit/core";
import {
  useSortable as baseUseSortable,
  UseSortableArguments,
} from "@dnd-kit/sortable";

export type TypesafeActive<DragData> = Omit<Active, "data"> & {
  data: React.MutableRefObject<DragData | undefined>;
};
export type TypesafeOver<DropData> = Omit<Over, "data"> & {
  data: React.MutableRefObject<DropData | undefined>;
};

export type DragStartEvent<DragData> = Omit<
  OriginalDragStartEvent,
  "active"
> & {
  active: TypesafeActive<DragData>;
};

export type DragMoveEvent<DragData, DropData> = Omit<
  OriginalDragMoveEvent,
  "active" | "over"
> & {
  active: TypesafeActive<DragData>;
  over: TypesafeOver<DropData> | null;
};

export type DragOverEvent<DragData, DropData> = Omit<
  OriginalDragOverEvent,
  "active" | "over"
> & {
  active: TypesafeActive<DragData>;
  over: TypesafeOver<DropData> | null;
};

export type DragEndEvent<DragData, DropData> = Omit<
  OriginalDragEndEvent,
  "active" | "over"
> & {
  active: TypesafeActive<DragData>;
  over: TypesafeOver<DropData> | null;
};

export type DragCancelEvent<DragData, DropData> = Omit<
  OriginalDragCancelEvent,
  "active" | "over"
> & {
  active: TypesafeActive<DragData>;
  over: TypesafeOver<DropData> | null;
};

export type CollisionDetection<DragData, DropData> = (
  e: Omit<
    Parameters<OriginalCollisionDetection>[0],
    "active" | "droppableContainers"
  > & {
    active: TypesafeActive<DragData>;
    droppableContainers: Array<
      Omit<OriginalDroppableContainer, "data"> & {
        data: React.MutableRefObject<DropData | undefined>;
      }
    >;
  }
) => Array<
  Omit<Collision, "data"> & {
    data: React.MutableRefObject<DropData | undefined>;
  }
>;

const typedDnd = <DragData, DropData, SortableData = {}>() => {
  type ContextProps = Omit<
    DndContextProps,
    | "onDragStart"
    | "onDragMove"
    | "onDragOver"
    | "onDragEnd"
    | "onDragCancel"
    | "cancelDrop"
    | "collisionDetection"
  > & {
    onDragStart?: (e: DragStartEvent<DragData>) => void;
    onDragMove?: (e: DragMoveEvent<DragData, DropData>) => void;
    onDragOver?: (e: DragOverEvent<DragData, DropData>) => void;
    onDragEnd?: (e: DragEndEvent<DragData, DropData>) => void;
    onDragCancel?: (e: DragCancelEvent<DragData, DropData>) => void;
    cancelDrop?: (
      e: Omit<Parameters<CancelDrop>[0], "active" | "over"> & {
        active: TypesafeActive<DragData>;
        over: TypesafeOver<DropData> | null;
      }
    ) => ReturnType<CancelDrop>;
    collisionDetection?: CollisionDetection<DragData, DropData>;
  };

  const DndContext: React.NamedExoticComponent<ContextProps> =
    OriginalDndContext as any;

  const useDndMonitor: (
    args: Pick<
      ContextProps,
      "onDragStart" | "onDragMove" | "onDragOver" | "onDragEnd" | "onDragCancel"
    >
  ) => void = baseUseDndMonitor as any;

  const useDraggable: (
    args: Omit<UseDraggableArguments, "data"> & { data: DragData }
  ) => Omit<ReturnType<typeof baseUseDraggable>, "active" | "over"> & {
    active: TypesafeActive<DragData> | null;
    over: TypesafeOver<DropData> | null;
  } = baseUseDraggable as any;

  const useDroppable: (
    args: Omit<UseDroppableArguments, "data"> & { data: DropData }
  ) => Omit<ReturnType<typeof baseUseDroppable>, "active" | "over"> & {
    active: TypesafeActive<DragData> | null;
    over: TypesafeOver<DropData> | null;
  } = baseUseDroppable as any;

  const useSortable: (
    args: Omit<UseSortableArguments, "data"> & { data: SortableData }
  ) => Omit<ReturnType<typeof baseUseSortable>, "active" | "over"> & {
    active: TypesafeActive<DragData> | null;
    over: TypesafeOver<DropData> | null;
  } = baseUseSortable as any;

  return {
    DndContext,
    useDndMonitor,
    useDraggable,
    useDroppable,
    useSortable,
  };
};

export default typedDnd;
