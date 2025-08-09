import { Module } from '@nestjs/common';
import { HeaderUserGuard } from './header-user.guard';

@Module({
  providers: [HeaderUserGuard],
  exports: [HeaderUserGuard],
})
export class AuthModule {}