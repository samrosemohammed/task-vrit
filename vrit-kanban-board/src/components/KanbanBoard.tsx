import { useEffect, useMemo, useState } from "react";
import { Plus, Redo, Search, Undo } from "lucide-react";
import { Column, HistoryItem, Id, Task } from "../types";
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
  const [columns, setColumns] = useState<Column[]>(() => {
    const savedColumns = localStorage.getItem("columns");
    return savedColumns ? JSON.parse(savedColumns) : [];
  });
  const [task, setTask] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  useEffect(() => {
    localStorage.setItem("columns", JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(task));
  }, [task]);

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
    const columnToDelete = columns.find((col) => col.id === id);
    const associatedTasks = task.filter((t) => t.columnId === id);

    if (columnToDelete) {
      setHistory((prev) => [
        ...prev,
        {
          type: "deleteColumn",
          data: { column: columnToDelete, tasks: associatedTasks },
        },
      ]);
      setRedoStack([]);
      setColumns(columns.filter((col) => col.id !== id));
      setTask(task.filter((t) => t.columnId !== id));
    }
  };

  const deleteTask = (id: Id) => {
    const taskToDelete = task.find((t) => t.id === id);

    if (taskToDelete) {
      setHistory((prev) => [
        ...prev,
        { type: "deleteTask", data: taskToDelete },
      ]);
      setRedoStack([]);
      setTask(task.filter((t) => t.id !== id));
    }
  };

  const undo = () => {
    if (history.length === 0) return;

    const lastOperation = history.pop()!;
    setRedoStack((prev) => [lastOperation, ...prev]);

    if (lastOperation.type === "deleteColumn") {
      const { column, tasks } = lastOperation.data;
      setColumns((prev) => [...prev, column]);
      setTask((prev) => [...prev, ...tasks]);
    }

    if (lastOperation.type === "deleteTask") {
      setTask((prev) => [...prev, lastOperation.data]);
    }

    setHistory([...history]);
  };

  const redo = () => {
    if (redoStack.length === 0) return;

    const lastOperation = redoStack.shift()!;
    setHistory((prev) => [...prev, lastOperation]);

    if (lastOperation.type === "deleteColumn") {
      const { column } = lastOperation.data;
      setColumns((prev) => prev.filter((col) => col.id !== column.id));
      setTask((prev) => prev.filter((task) => task.columnId !== column.id));
    }

    if (lastOperation.type === "deleteTask") {
      setTask((prev) =>
        prev.filter((task) => task.id !== lastOperation.data.id)
      );
    }

    setRedoStack([...redoStack]);
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

  const filteredColumns = useMemo(() => {
    if (!searchQuery) return columns;

    const lowerCaseQuery = searchQuery.toLowerCase();

    return columns.filter((col) => {
      // Check if column title matches the search query
      const columnMatches = col.title.toLowerCase().includes(lowerCaseQuery);

      // Check if any task in the column matches the search query
      const tasksInColumn = task.filter((t) => t.columnId === col.id);
      const taskMatches = tasksInColumn.some((t) =>
        t.content.toLowerCase().includes(lowerCaseQuery)
      );

      return columnMatches || taskMatches;
    });
  }, [searchQuery, columns, task]);

  return (
    <div className="">
      <div className="p-4 mb-4 flex gap-2 justify-between">
        <div className="flex md:flex-row flex-col gap-2 w-full">
          <form action="" className="max-w-md w-full">
            <div className="relative text-lg">
              <Search
                size={22}
                className="absolute left-3 top-2.5 translate-y-1/2"
              />
              <input
                id="search-card"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Card"
                className="w-full pl-10 px-4 py-4 rounded-md outline-none border-2 border-zinc-200 hover:ring-2 hover:ring-zinc-300"
              />
            </div>
          </form>
          <button
            onClick={createColumn}
            className="flex gap-2 cursor-pointer rounded-lg bg-white border-2 border-zinc-200 p-4 hover:ring-2 hover:ring-zinc-300"
          >
            <Plus /> Add Column
          </button>
        </div>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={undo}
            className="bg-white p-4 box-content rounded-lg border-2 border-zinc-200 hover:ring-2 hover:ring-zinc-300"
            disabled={history.length === 0}
          >
            <Undo />
          </button>
          <button
            onClick={redo}
            className="bg-white p-4 box-content rounded-lg border-2 border-zinc-200 hover:ring-2 hover:ring-zinc-300"
            disabled={redoStack.length === 0}
          >
            <Redo />
          </button>
        </div>
      </div>
      <div className="m-auto p-4">
        <DndContext
          sensors={sensors}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
        >
          <div className=" gap-4">
            <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <SortableContext items={columnsID}>
                {filteredColumns.map((col) => (
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
    </div>
  );
};

export default KanbanBoard;
