import { User } from '../entities/user.entity';

export interface UserRepository {
  create(name?: unknown): Promise<User>;
  findById(id: string): Promise<User | null>;
  findOrCreateById(id: string, name?: unknown): Promise<User | null>;
}