import { useState } from "react";
import { Id, Task } from "../types";
import { Trash } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskCardProps {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
}

const TaskCard = ({ task, deleteTask, updateTask }: TaskCardProps) => {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: editMode,
  });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };
  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="relative bg-zinc-200/50 p-2.5 h-[100px] min-h-[100px] flex text-left rounded items-center hover:ring-2 hover:ring-inset hover:ring-zinc-300 cursor-grab"
      >
        <textarea
          value={task.content}
          autoFocus
          placeholder="Task Content Here"
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if (e.key == "Enter" && e.shiftKey) toggleEditMode();
          }}
          onChange={(e) => updateTask(task.id, e.target.value)}
          className="h-[90%] w-full resize-none border-none rounded bg-transparent text-zinc-700 focus:outline-none"
        ></textarea>
      </div>
    );
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative opacity-50 bg-zinc-200/50 p-2.5 h-[100px] min-h-[100px] flex text-left rounded items-center border-2 border-zinc-300 cursor-grab"
      />
    );
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={toggleEditMode}
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      className="task relative bg-zinc-200/50 p-2.5 h-[100px] min-h-[100px] flex text-left rounded items-center hover:ring-2 hover:ring-inset hover:ring-zinc-300 cursor-grab"
    >
      <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
        {task.content}
      </p>
      {mouseIsOver && (
        <button
          onClick={() => deleteTask(task.id)}
          className="p-2 bg-red-300/30 text-red-500 opacity-60 hover:opacity-100 absolute right-4 translate-y-1/2 rounded"
        >
          <Trash className="" size={18} />
        </button>
      )}
    </div>
  );
};

export default TaskCard;
