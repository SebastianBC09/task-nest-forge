import { Task } from '../entities/task.entity';

export interface TaskRepository {
  create(params: { title: unknown; description?: unknown; ownerId: unknown}): Promise<Task>;
  update(task: Task): Promise<Task>;
  findById(id: string, ownerId: string): Promise<Task | null>;
  findAllByOwner(ownerId: string): Promise<Task[]>;
  deleteById(id: string, ownerId: string): Promise<void>;
}