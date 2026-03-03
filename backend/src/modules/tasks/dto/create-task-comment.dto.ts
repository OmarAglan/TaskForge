import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTaskCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Comment is required' })
  @MaxLength(1000, { message: 'Comment must not exceed 1000 characters' })
  comment: string;
}
