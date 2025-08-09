import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { Task } from '../../domain/entities/task.entity';
import { Prisma, Task as TaskRecord } from '@prisma/client'

@Injectable()
export class TaskPrismaRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {
  }

  async create(params: { title: string; description?: string | null; ownerId: string }): Promise<Task> {
    const createData: Prisma.TaskCreateInput = {
      title: params.title.trim(),
      description: params.description?.trim() ?? null,
      owner: { connect: { id: params.ownerId } },
      status: 'PENDING',
    };
    const record: TaskRecord = await this.prisma.task.create({ data: createData });
    return Task.fromPersistence(record);
  }

  async update(task: Task): Promise<Task> {
    const record: TaskRecord = await this.prisma.task.update({
      where: { id: task.id },
      data: {
        title: task.title,
        description: task.description,
        status: task.status,
        updatedAt: new Date(),
        deletedAt: task.deletedAt,
        version: { increment: 1 },
      },
    });
    return Task.fromPersistence(record);
  }

  async findById(id: string, ownerId: string): Promise<Task | null> {
    const record = await this.prisma.task.findFirst({
      where: { id, ownerId, deletedAt: null },
    });
    if(!record) return null;
    return Task.fromPersistence(record)
  }

  async findAllByOwner(ownerId: string): Promise<Task[]> {
    const rows: TaskRecord[] = await this.prisma.task.findMany({
      where: { ownerId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => Task.fromPersistence(r));
  }

  async deleteById(id: string, ownerId: string): Promise<void> {
    await this.prisma.task.updateMany({
      where: { id, ownerId, deletedAt: null },
      data: { deletedAt: new Date() },
    })
  }
}