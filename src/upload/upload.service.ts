import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { IUploadService } from "./upload.service.interface.js";
import { STORAGE_SERVICE } from "./storage/storage.interface.js";
import type { IStorageService } from "./storage/storage.interface.js";
import { UploadResponseDto } from "./dto/response/upload-response.dto.js";
import {
  MessageResponseDto,
  SuccessResponseDto,
} from "../common/dto/status.dto.js";
import { PrismaTransactionContext } from "../common/prisma/prisma-transaction-context.service.js";

@Injectable()
export class UploadService implements IUploadService {
  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
    private readonly txContext: PrismaTransactionContext,
    private readonly i18nService: I18nService,
  ) {}

  async uploadCover(
    barbershopId: string,
    file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    const client = this.txContext.getClient();

    const barbershop = await client.barbershop.findUnique({
      where: { id: barbershopId },
    });
    if (!barbershop) {
      throw new NotFoundException(
        this.i18nService.translate("errors.BARBERSHOP.NOT_FOUND"),
      );
    }

    // Delete old cover if exists
    if (barbershop.coverImageUrl) {
      await this.storageService
        .delete(barbershop.coverImageUrl)
        .catch(() => {});
    }

    const imageUrl = await this.storageService.upload(
      file,
      `barbershops/${barbershopId}/cover`,
    );

    await client.barbershop.update({
      where: { id: barbershopId },
      data: { coverImageUrl: imageUrl },
    });

    return { imageUrl };
  }

  async uploadGallery(
    barbershopId: string,
    file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    const client = this.txContext.getClient();

    const barbershop = await client.barbershop.findUnique({
      where: { id: barbershopId },
    });
    if (!barbershop) {
      throw new NotFoundException(
        this.i18nService.translate("errors.BARBERSHOP.NOT_FOUND"),
      );
    }

    const imageUrl = await this.storageService.upload(
      file,
      `barbershops/${barbershopId}/gallery`,
    );

    // Get max display order
    const maxOrder = await client.barbershopImage.aggregate({
      where: { barbershopId },
      _max: { displayOrder: true },
    });

    await client.barbershopImage.create({
      data: {
        barbershopId,
        imageUrl,
        displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
      },
    });

    return { imageUrl };
  }

  async removeGalleryImage(
    imageId: string,
    user: { loggedInAs: string; barbershopId?: string },
  ): Promise<MessageResponseDto> {
    const client = this.txContext.getClient();

    const image = await client.barbershopImage.findUnique({
      where: { id: imageId },
    });
    if (!image) {
      throw new NotFoundException(
        this.i18nService.translate("errors.UPLOAD.NOT_FOUND"),
      );
    }

    // Tenant isolation: BARBERSHOP_OWNER can only delete their own images
    if (
      user.loggedInAs === "BARBERSHOP_OWNER" &&
      image.barbershopId !== user.barbershopId
    ) {
      throw new ForbiddenException(
        "You can only delete images from your own barbershop",
      );
    }

    await this.storageService.delete(image.imageUrl).catch(() => {});
    await client.barbershopImage.delete({ where: { id: imageId } });

    return new SuccessResponseDto(
      this.i18nService.translate("messages.UPLOAD.DELETED"),
    );
  }
}
