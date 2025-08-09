import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTaskCommand } from '../dtos/create-task.command';
import type { TaskRepository } from '../../domain/repositories/task.repository';
import { Title } from '../../domain/value-objects/title';
import { isNonEmptyString, isUuidString } from '../../domain/guards/type-guards';
import { Task } from '../../domain/entities/task.entity';

@Injectable()
export class CreateTaskService {
  constructor(
    @Inject('TaskRepository') private readonly taskRepo: TaskRepository
  ) {}

  async execute(input: CreateTaskCommand): Promise<Task> {
    if (!isNonEmptyString(input.title)) {
      throw new BadRequestException(
        'title is required and must be a non empty string',
      );
    }
    if (!isUuidString(input.ownerId)) {
      throw new BadRequestException(
        'ownerId is required and must be a valid UUID string',
      );
    }

    const title = Title.create(input.title).value;
    const ownerId = String(input.ownerId);
    const description =
      input.description == null ? null : String(input.description).trim();

    const payload = {
      title,
      description,
      ownerId
    };

    try {
      return await this.taskRepo.create(payload);
    } catch (error) {
      throw new InternalServerErrorException('Error creating task');
    }
  }
}
