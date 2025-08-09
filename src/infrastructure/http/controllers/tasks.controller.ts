import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { HeaderUserGuard } from '../../auth/header-user.guard';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { ChangeStatusDto } from '../dtos/change-status.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { CreateTaskCommand } from '../../../application/dtos/create-task.command';
import { CreateTaskService } from '../../../application/services/create-task.service';
import { UpdateTaskService } from '../../../application/services/update-task.service';
import { ChangeTaskStatusService } from '../../../application/services/change-task-status.service';
import { ListTasksService } from '../../../application/services/list-tasks.service';
import { DeleteTaskService } from '../../../application/services/delete-task.service';
import { UsersService } from '../../../application/services/users.service';

@UseGuards(HeaderUserGuard)
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly createTask: CreateTaskService,
    private readonly updateTask: UpdateTaskService,
    private readonly changeStatus: ChangeTaskStatusService,
    private readonly listTasks: ListTasksService,
    private readonly deleteTask: DeleteTaskService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async list(@Req() req) {
    const tasks = await this.listTasks.execute({ ownerId: req.user.id });
    return tasks.map(t => t.toResponseDto());
  }

  @Post()
  async create(@Body() dto: CreateTaskDto, @Req() req) {
    const ownerId: string = req.user.id;
    await this.usersService.findOrCreateById(ownerId);

    const input: CreateTaskCommand = {
      title: dto.title.trim(),
      description: dto. description ?? null,
      ownerId: req.user.id
    };
    const task = await this.createTask.execute(input);
    return task.toResponseDto();
  }

  @Patch(':id/status')
  async change(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req ) {
    const ownerId: string = req.user.id;

    const updated = await this.changeStatus.execute({
      id,
      ownerId,
      status: dto.status,
    });
    if (!updated) throw new NotFoundException('Task not found');
    return updated.toResponseDto();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Req() req ) {
    const ownerId: string = req.user.id;

    const updated = await this.updateTask.execute({
      id,
      ownerId,
      title: dto.title,
      description: dto. description,
      version: dto.version,
    });
    if (!updated) throw new NotFoundException('Task not found');
    return updated.toResponseDto();
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @Req() req) {
    const ownerId: string = req.user.id;
    await this.deleteTask.execute({ id, ownerId });
    return { message: 'Deleted' };
  }
}
