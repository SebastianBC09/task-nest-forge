export type ChangeStatusCommand = {
  id: string;
  ownerId: string;
  status: 'PENDING' | 'COMPLETED';
};