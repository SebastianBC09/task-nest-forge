import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Task } from '../../domain/entities/task.entity';
import type { TaskRepository } from '../../domain/repositories/task.repository';
import { isNonEmptyString, isUuidString } from '../../domain/guards/type-guards';
import { UpdateTaskCommand } from '../dtos/update-task.command';


@Injectable()
export class UpdateTaskService {
  constructor(@Inject('TaskRepository') private readonly taskRepo: TaskRepository) {}

  async execute(input: UpdateTaskCommand): Promise<Task> {
    if(!isUuidString(input.id) || !isUuidString(input.ownerId)) {
      throw new BadRequestException('Invalid id or ownerId');
    }

    const task = await this.taskRepo.findById(input.id, input.ownerId);
    if(!task) throw new NotFoundException('Task not found');

    if(typeof input.version === 'number' && input.version !== task.version) {
      throw new ConflictException('Task has been modified by another process');
    }

    if (input.title !== undefined) {
      if (!isNonEmptyString(input.title)) {
        throw new BadRequestException('title must be a non-empty string');
      }
      task.updateTitle(input.title);
    }

    if (input.description !== undefined) {
      task.updateDescription(input.description);
    }

    try {
      return await this.taskRepo.update(task);
    } catch (err) {
      throw new InternalServerErrorException('Failed to update task');
    }
  }
}