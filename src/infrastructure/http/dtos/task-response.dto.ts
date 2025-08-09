export type TaskResponseDto = {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'COMPLETED';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  version: number;
};
