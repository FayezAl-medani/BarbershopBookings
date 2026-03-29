import {
  Controller,
  Post,
  Delete,
  Param,
  Inject,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ForbiddenException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiInternalServerErrorResponse,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { UPLOAD_SERVICE } from "./upload.service.interface.js";
import type { IUploadService } from "./upload.service.interface.js";
import { DataResponseDto } from "../common/dto/data-response.dto.js";
import {
  ErrorResponseDto,
  MessageResponseDto,
} from "../common/dto/status.dto.js";
import {
  ApiDataResponse,
  ApiMessageResponse,
} from "../common/decorators/response.decorator.js";
import { Roles } from "../common/decorators/roles.decorator.js";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import { RoleName } from "../common/enums/role-name.enum.js";
import { JwtPayloadWithAuth } from "../common/entities/index.js";
import { UploadResponseDto } from "./dto/response/upload-response.dto.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Upload")
@Controller("upload")
export class UploadController {
  constructor(
    @Inject(UPLOAD_SERVICE)
    private readonly uploadService: IUploadService,
  ) {}

  /** Verify BARBERSHOP_OWNER can only upload to their own barbershop */
  private assertBarbershopAccess(
    barbershopId: string,
    user: JwtPayloadWithAuth,
  ): void {
    if (user.loggedInAs !== RoleName.BARBERSHOP_OWNER) return;
    if (barbershopId !== user.barbershopId) {
      throw new ForbiddenException(
        "You can only upload images for your own barbershop",
      );
    }
  }

  @Post("barbershop/:id/cover")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.BARBERSHOP_OWNER)
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  @ApiOperation({ summary: "Upload barbershop cover image" })
  @ApiDataResponse(UploadResponseDto)
  async uploadCover(
    @Param("id") barbershopId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/i }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<UploadResponseDto>> {
    this.assertBarbershopAccess(barbershopId, user);
    const result = await this.uploadService.uploadCover(barbershopId, file);
    return new DataResponseDto(result);
  }

  @Post("barbershop/:id/gallery")
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.SUPER_ADMIN, RoleName.BARBERSHOP_OWNER)
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  @ApiOperation({ summary: "Add barbershop gallery image" })
  @ApiDataResponse(UploadResponseDto)
  async uploadGallery(
    @Param("id") barbershopId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/i }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<UploadResponseDto>> {
    this.assertBarbershopAccess(barbershopId, user);
    const result = await this.uploadService.uploadGallery(barbershopId, file);
    return new DataResponseDto(result);
  }

  @Delete("barbershop-image/:id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiMessageResponse()
  @ApiOperation({ summary: "Delete barbershop gallery image" })
  async removeGalleryImage(
    @Param("id") imageId: string,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<MessageResponseDto> {
    return this.uploadService.removeGalleryImage(imageId, user);
  }
}
