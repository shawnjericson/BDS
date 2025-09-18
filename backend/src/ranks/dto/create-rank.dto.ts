import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRankDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
