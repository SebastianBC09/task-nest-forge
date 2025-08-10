import { Module } from '@nestjs/common';
import { CreateTaskService } from './services/create-task.service';
import { UpdateTaskService } from './services/update-task.service';
import { ChangeTaskStatusService } from './services/change-task-status.service';
import { ListTasksService } from './services/list-tasks.service';
import { DeleteTaskService } from './services/delete-task.service';
import { TasksController } from '../infrastructure/http/controllers/tasks.controller';
import { PersistenceModule } from '../infrastructure/persistence/persistence.module';
import { AuthModule } from '../infrastructure/auth/auth.module';
import { UsersModule } from './users.module';

@Module({
  imports: [PersistenceModule, AuthModule, UsersModule],
  controllers: [TasksController],
  providers: [
    CreateTaskService,
    UpdateTaskService,
    ListTasksService,
    ChangeTaskStatusService,
    DeleteTaskService,
  ],
})
export class TasksModule {}
