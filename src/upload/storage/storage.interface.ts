export const STORAGE_SERVICE = "IStorageService";

export interface IStorageService {
  upload(file: Express.Multer.File, folder: string): Promise<string>;
  delete(filePath: string): Promise<void>;
}
