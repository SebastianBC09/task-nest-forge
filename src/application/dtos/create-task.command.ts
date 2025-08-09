export type CreateTaskCommand = {
  title: string;
  description?: string | null;
  ownerId: string;
};