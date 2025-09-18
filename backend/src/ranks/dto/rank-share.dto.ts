import { IsString, IsNumber, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RankShareDto {
  @IsString()
  role: string;

  @IsNumber()
  @Min(0.0001)
  @Max(1)
  pct: number;
}

export class UpdateRankSharesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RankShareDto)
  shares: RankShareDto[];
}

export class AssignUserRankDto {
  @IsNumber()
  rankId: number;
}
