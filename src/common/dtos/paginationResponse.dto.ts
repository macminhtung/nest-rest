import { applyDecorators, Type } from '@nestjs/common';
import { ApiProperty, getSchemaPath, ApiOkResponse, ApiExtraModels } from '@nestjs/swagger';
import { GetRecordsPaginationDto } from '@/common/dtos';

export const ApiOkResponsePaginated = <DataDto extends Type<unknown>>(dataDto: DataDto) =>
  applyDecorators(
    ApiExtraModels(PaginationResponseDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginationResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    }),
  );

export class PaginationResponseDto<E> {
  constructor(payload: { args: GetRecordsPaginationDto; total: number; data: E[] }) {
    const { args, total, data } = payload;
    const { page = 1, take = 1, isSelectAll } = args;
    this.page = page;
    this.take = take;
    this.total = total;
    this.pageCount = isSelectAll ? 1 : Math.ceil(total / take) || 1;
    this.hasPreviousPage = page > 1;
    this.hasNextPage = page < this.pageCount;
    this.data = data;
  }

  @ApiProperty({ type: 'number' })
  page: number;

  @ApiProperty({ type: 'number' })
  take: number;

  @ApiProperty({ type: 'number' })
  total: number;

  @ApiProperty({ type: 'number' })
  pageCount: number;

  @ApiProperty({ type: 'boolean' })
  hasPreviousPage: boolean;

  @ApiProperty({ type: 'boolean' })
  hasNextPage: boolean;

  @ApiProperty({ type: () => Array<E> })
  data: E[];
}
