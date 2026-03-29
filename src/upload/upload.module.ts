import { Module } from "@nestjs/common";
import { UploadController } from "./upload.controller.js";
import { UploadService } from "./upload.service.js";
import { UPLOAD_SERVICE } from "./upload.service.interface.js";
import { STORAGE_SERVICE } from "./storage/storage.interface.js";
import { LocalStorageService } from "./storage/local-storage.service.js";

@Module({
  controllers: [UploadController],
  providers: [
    {
      provide: STORAGE_SERVICE,
      useClass: LocalStorageService,
    },
    {
      provide: UPLOAD_SERVICE,
      useClass: UploadService,
    },
  ],
  exports: [UPLOAD_SERVICE, STORAGE_SERVICE],
})
export class UploadModule {}
