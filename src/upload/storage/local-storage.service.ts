import { Injectable, BadRequestException } from "@nestjs/common";
import { IStorageService } from "./storage.interface.js";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly uploadDir = path.join(process.cwd(), "uploads");

  /**
   * Resolve a path and verify it stays within the uploads directory.
   * Prevents path traversal attacks (e.g. folder = "../../etc").
   */
  private assertWithinUploads(resolvedPath: string): void {
    const normalized = path.resolve(resolvedPath);
    if (!normalized.startsWith(this.uploadDir)) {
      throw new BadRequestException("Invalid file path");
    }
  }

  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    const dir = path.join(this.uploadDir, folder);
    this.assertWithinUploads(dir);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(dir, filename);

    fs.writeFileSync(filePath, file.buffer);

    return `/uploads/${folder}/${filename}`;
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.resolve(process.cwd(), filePath);
    this.assertWithinUploads(fullPath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}
