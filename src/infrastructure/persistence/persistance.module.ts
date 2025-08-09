import { PrismaModule } from './prisma.module';
import { Module } from '@nestjs/common';
import { TaskPrismaRepository } from './task-prisma-repository';
import { UserPrismaRepository } from './user-prisma-repository';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: 'TaskRepository', useClass: TaskPrismaRepository },
    { provide: 'UserRepository', useClass: UserPrismaRepository },
  ],
  exports: ['TaskRepository', 'UserRepository'],
})
export class PersistenceModule {}