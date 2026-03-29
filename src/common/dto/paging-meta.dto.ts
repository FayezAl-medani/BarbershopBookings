import { ApiProperty } from "@nestjs/swagger";

export interface IPagingMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
}

export class PagingMeta implements IPagingMeta {
  @ApiProperty({
    example: 100,
    description: "Total number of items across all pages",
  })
  total: number;

  @ApiProperty({
    example: 10,
    description: "Last page number",
  })
  lastPage: number;

  @ApiProperty({
    example: 1,
    description: "Current page number",
  })
  currentPage: number;

  @ApiProperty({
    example: 10,
    description: "Number of items per page",
  })
  perPage: number;

  @ApiProperty({
    example: null,
    nullable: true,
    description: "Previous page number (null if on first page)",
    required: false,
  })
  prev: number | null;

  @ApiProperty({
    example: 2,
    nullable: true,
    description: "Next page number (null if on last page)",
    required: false,
  })
  next: number | null;
}
