export type UpdateTaskCommand = {
  id: string;
  ownerId: string;
  title?: string;
  description?: string | null;
  version?: number;
};