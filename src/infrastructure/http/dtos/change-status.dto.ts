import { IsEnum } from 'class-validator';

export enum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED'
}

export class ChangeStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}