import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { TaskRepository } from '../../domain/repositories/task.repository';
import { ListTasksQuery } from '../dtos/list-tasks.query';
import { isUuidString } from '../../domain/guards/type-guards';
import { Task } from '../../domain/entities/task.entity';

@Injectable()
export class ListTaskService {
  constructor(@Inject('TaskRepository') private taskRepo: TaskRepository) {}

  async execute(query: ListTasksQuery): Promise<Task[]> {
    if (!isUuidString(query.ownerId)) throw new BadRequestException('Invalid ownerId');
    return this.taskRepo.findAllByOwner(query.ownerId);
  }
}