import { UploadResponseDto } from "./dto/response/upload-response.dto.js";
import { MessageResponseDto } from "../common/dto/status.dto.js";

export const UPLOAD_SERVICE = "IUploadService";

export interface IUploadService {
  uploadCover(
    barbershopId: string,
    file: Express.Multer.File,
  ): Promise<UploadResponseDto>;
  uploadGallery(
    barbershopId: string,
    file: Express.Multer.File,
  ): Promise<UploadResponseDto>;
  removeGalleryImage(
    imageId: string,
    user: { loggedInAs: string; barbershopId?: string },
  ): Promise<MessageResponseDto>;
}
