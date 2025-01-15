import { useMemo, useState } from "react";
import { Column, Id, Task } from "../types";
import { CirclePlus, Trash } from "lucide-react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";

interface ColumnContainerProps {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (columId: Id) => void;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
  task: Task[];
}
const ColumnContainer = (props: ColumnContainerProps) => {
  const {
    column,
    deleteColumn,
    updateColumn,
    createTask,
    task,
    deleteTask,
    updateTask,
  } = props;
  const [editMode, setEditMode] = useState(false);
  const tasksIds = useMemo(() => task.map((t) => t.id), [task]);
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  const taskCount = task.length;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white w-[350px] h-[80vh] max-h-[500px] rounded-md flex flex-col border-2 border-zinc-300"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white h-[80vh] max-h-[500px] rounded-md flex flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => setEditMode(true)}
        className="bg-white text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-zinc-200 border-2 flex justify-between items-center"
      >
        <div className="flex gap-2">
          <div className="flex justify-center items-center bg-zinc-200/40 px-2 py-1 text-sm rounded-full">
            {taskCount}
          </div>
          {!editMode && column.title}
          {editMode && (
            <input
              className="outline-none bg-white focus:border-zinc-300 border rounded px-2"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
              autoFocus
              onBlur={() => setEditMode(false)}
            />
          )}
        </div>
        <button
          className="bg-red-300/30 p-2 rounded-md"
          onClick={() => deleteColumn(column.id)}
        >
          <Trash size={20} className="text-red-500" />
        </button>
      </div>
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
          {task.map((t) => (
            <TaskCard
              updateTask={updateTask}
              deleteTask={deleteTask}
              key={t.id}
              task={t}
            />
          ))}
        </SortableContext>
      </div>
      <div className="flex flex-grow"></div>
      <div className="flex gap-2 items-center border-zinc-200 border-2 p-4 hover:bg-zinc-300/30  active:bg-zinc-300">
        <button
          className="flex items-center gap-2"
          onClick={() => createTask(column.id)}
        >
          <CirclePlus size={18} />
          Add Task
        </button>
      </div>
    </div>
  );
};

export default ColumnContainer;
