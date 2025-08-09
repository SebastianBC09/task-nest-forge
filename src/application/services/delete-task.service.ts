import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { TaskRepository } from '../../domain/repositories/task.repository';
import { DeleteTaskCommand } from '../dtos/delete-task.command';
import { isUuidString } from '../../domain/guards/type-guards';

@Injectable()
export class DeleteTaskService {
  constructor(@Inject('TaskRepository') private taskRepo: TaskRepository) {}

  async execute(input: DeleteTaskCommand): Promise<void> {
    if(!isUuidString(input.id) || !isUuidString(input.ownerId)) {
      throw new BadRequestException('Invalid ownerId');
    }
    const existingTask = await this.taskRepo.findById(input.id, input.ownerId);
    if (!existingTask) throw new NotFoundException('Task not found');

    try {
      await this.taskRepo.deleteById(input.id, input.ownerId);
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete task');
    }
  }
}