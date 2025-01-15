export type Id = string | number;
export type Column = {
  id: Id;
  title: string;
};

export type Task = {
  id: Id;
  columnId: Id;
  content: string;
};

export type HistoryItem =
  | {
      type: "deleteColumn";
      data: { column: Column; tasks: Task[] };
    }
  | {
      type: "deleteTask";
      data: Task;
    };
