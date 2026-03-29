import { ApiProperty } from "@nestjs/swagger";
import { ResponseStatus } from "../enums/index.js";

export class StatusDTO {
  @ApiProperty({
    enum: ResponseStatus,
    example: ResponseStatus.ERROR,
    description: "Response status indicator",
  })
  status: ResponseStatus;

  constructor(status: ResponseStatus) {
    this.status = status;
  }
}

export class MessageResponseDto extends StatusDTO {
  @ApiProperty({
    description: "Human-readable message describing the operation result",
  })
  message: string;

  constructor(status: ResponseStatus, message: string) {
    super(status);
    this.message = message;
  }
}

export class ErrorResponseDto extends MessageResponseDto {
  constructor(message: string) {
    super(ResponseStatus.ERROR, message);
  }
}

export class SuccessResponseDto extends MessageResponseDto {
  constructor(message: string) {
    super(ResponseStatus.SUCCESS, message);
  }
}
