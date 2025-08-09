import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/persistence/prisma.module';
import { PrismaService } from './infrastructure/persistence/prisma.service';
import { AuthModule } from './infrastructure/auth/auth.module';
import { PersistenceModule } from './infrastructure/persistence/persistance.module';
import { TasksModule } from './application/tasks.module';

@Module({
  imports: [PrismaModule, PersistenceModule, AuthModule, TasksModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
