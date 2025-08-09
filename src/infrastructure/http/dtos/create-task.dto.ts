import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @Length(1, 200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;
}