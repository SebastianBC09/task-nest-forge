import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UserPrismaRepository } from '../infrastructure/persistence/user-prisma-repository';
import { PrismaModule } from '../infrastructure/persistence/prisma.module';
import { UsersController } from '../infrastructure/http/controllers/users.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: 'UserRepository', useClass: UserPrismaRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}