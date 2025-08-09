import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { TaskRepository } from '../../domain/repositories/task.repository';
import { ChangeStatusCommand } from '../dtos/change-status.command';
import { isUuidString } from '../../domain/guards/type-guards';
import { Task } from '../../domain/entities/task.entity';

@Injectable()
export class ChangeTaskStatusService {
  constructor(@Inject('TaskRepository') private taskRepo: TaskRepository) {}

  async execute(input: ChangeStatusCommand): Promise<Task> {
    if(!isUuidString(input.id) || !isUuidString(input.id)) {
      throw new BadRequestException('Invalid id or ownerId');
    }

    const task = await this.taskRepo.findById(input.id, input.ownerId);
    if(!task) throw new NotFoundException('Task not found');

    if (input.status === 'COMPLETED') {
      task.markAsCompleted();
    } else {
      task.markAsPending();
    }

    try {
      return await this.taskRepo.update(task);
    } catch (err) {
      throw new InternalServerErrorException('Failed to change status');
    }
  }
}