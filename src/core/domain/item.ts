export type Item = {
  id: number;
  parentId: number | null;
  title: string;
  completed: number;
  hasCheckbox: number;
  focusId: number;
  createdAt: string;
};

export type ThreadView = "all" | "active" | "completed";
