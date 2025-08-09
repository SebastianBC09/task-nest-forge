import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User } from '../../domain/entities/user.entity';
import { Prisma, User as UserRecord } from '@prisma/client';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class UserPrismaRepository implements UserRepository{
  constructor(private readonly prisma: PrismaService) {
  }

  async create(name?: string | null): Promise<User> {
    const createData: Prisma.UserCreateInput = { name: name?.trim() ?? null };
    const record: UserRecord = await this.prisma.user.create({ data: createData });
    return User.fromPersistence(record);
  }

  async findById(id: string): Promise<User | null> {
    const record: UserRecord | null = await this.prisma.user.findUnique({ where: { id } });
    if(!record) return null;
    return User.fromPersistence(record);
  }

  async findOrCreateById(id: string, name?: string | null): Promise<User> {
    const existing: UserRecord | null = await this.prisma.user.findUnique({ where: { id } });
    if (existing) return User.fromPersistence(existing);

    const createData: Prisma.UserCreateInput = { id, name: name?.trim() ?? null };
    const record: UserRecord = await this.prisma.user.create({ data: createData });
    return User.fromPersistence(record);
  }
}