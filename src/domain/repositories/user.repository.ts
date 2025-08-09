import { User } from '../entities/user.entity';

export interface UserRepository {
  create(name?: string | null): Promise<User>;
  findById(id: string): Promise<User | null>;
  findOrCreateById(id: string, name?: string | null): Promise<User>;
}