import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserCommand } from '../dtos/create-user.command';
import { UserDto } from '../dtos/user.dto';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UserRepository) {}

  async create(input: CreateUserCommand): Promise<UserDto> {
    const user = await this.usersRepo.create(input.name ?? null);
    if (!user) throw new InternalServerErrorException('Failed to create user');
    return this.toDto(user);
  }

  async findOrCreateById(id: string, name?: string | null): Promise<UserDto> {
    const user = await this.usersRepo.findOrCreateById(id, name ?? null);
    if (!user) throw new InternalServerErrorException('Failed to find or create user');
    return this.toDto(user);
  }

  async findById(id: string): Promise<UserDto | null> {
    const user = await this.usersRepo.findById(id);
    return user ? this.toDto(user) : null;
  }

  private toDto(user: User): UserDto {
    return {
      id: user.id,
      name: user.name ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

}