import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [task, setTask] = useState<Task[]>([]);
  const columnsID = useMemo(() => columns.map((col) => col.id), [columns]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const createColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };
    setColumns([...columns, columnToAdd]);
  };

  const generateId = () => {
    // generate random number
    return Math.floor(Math.random() * 1000);
  };

  const updateColumn = (id: Id, title: string) => {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });
    setColumns(newColumns);
  };

  const createTask = (columnId: Id) => {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${task.length + 1}`,
    };
    setTask([...task, newTask]);
  };

  const updateTask = (id: Id, content: string) => {
    const newTask = task.map((t) => {
      if (t.id !== id) return t;
      return { ...t, content };
    });
    setTask(newTask);
  };

  const deleteColumn = (id: Id) => {
    const newColumns = columns.filter((col) => col.id !== id);
    setColumns(newColumns);
  };

  const deleteTask = (id: Id) => {
    const newTask = task.filter((t) => t.id !== id);
    setTask(newTask);
  };

  const onDragStart = (e: DragStartEvent) => {
    console.log("Drage event ", e);
    if (e.active.data.current?.type === "Column") {
      const column = e.active.data.current.column;
      setActiveColumn(column);
      return;
    }
    if (e.active.data.current?.type === "Task") {
      setActiveTask(e.active.data.current.task);
    }
  };

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // If dragging tasks
    if (activeType === "Task" && overType === "Task") {
      setTask((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          tasks[activeIndex] = {
            ...tasks[activeIndex],
            columnId: tasks[overIndex].columnId,
          };
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;
    const activeColumnId = active.id;
    const overColumnId = over.id;
    if (activeColumnId === overColumnId) return;
    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === activeColumnId
      );
      const overColumnIndex = columns.findIndex(
        (col) => col.id === overColumnId
      );
      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  };
  return (
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden p-[40px]">
      <DndContext
        sensors={sensors}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsID}>
              {columns.map((col) => (
                <ColumnContainer
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                  updateColumn={updateColumn}
                  key={col.id}
                  deleteColumn={deleteColumn}
                  column={col}
                  createTask={createTask}
                  task={task.filter((t) => t.columnId === col.id)}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={createColumn}
            className="flex gap-2 h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-white border-2 border-zinc-200 p-4 hover:ring-2 hover:ring-zinc-300"
          >
            <Plus /> Add Column
          </button>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                task={task.filter((t) => t.columnId === activeColumn.id)}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
