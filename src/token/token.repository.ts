import { Injectable } from "@nestjs/common";
import { Token } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service.js";
import { PrismaTransactionContext } from "../common/prisma/prisma-transaction-context.service.js";
import { TokenCreateDto } from "./dto/request/token-create.dto.js";

@Injectable()
export class TokenRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(payload: TokenCreateDto): Promise<Token> {
    const client = this.txContext.getClient();
    return await client.token.create({ data: payload });
  }

  async findByAccessToken(accessToken: string): Promise<Token | null> {
    const client = this.txContext.getClient();
    return await client.token.findFirst({ where: { accessToken } });
  }

  async findByRefreshToken(refreshToken: string): Promise<Token | null> {
    const client = this.txContext.getClient();
    return await client.token.findFirst({ where: { refreshToken } });
  }

  async findByUserId(userId: string): Promise<Token | null> {
    const client = this.txContext.getClient();
    return await client.token.findFirst({ where: { userId } });
  }

  async updateById(id: string, data: Partial<TokenCreateDto>): Promise<Token> {
    const client = this.txContext.getClient();
    return await client.token.update({ where: { id }, data });
  }

  async updateByRefreshToken(
    refreshToken: string,
    data: Partial<TokenCreateDto>,
  ): Promise<Token> {
    const client = this.txContext.getClient();
    const token = await client.token.findFirst({ where: { refreshToken } });
    if (!token) throw new Error("Token not found");
    return await client.token.update({ where: { id: token.id }, data });
  }

  async deleteByAccessToken(accessToken: string): Promise<void> {
    const client = this.txContext.getClient();
    const token = await client.token.findFirst({ where: { accessToken } });
    if (token) {
      await client.token.delete({ where: { id: token.id } });
    }
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    const client = this.txContext.getClient();
    await client.token.deleteMany({ where: { userId } });
  }

  async existsByAccessToken(accessToken: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.token.count({ where: { accessToken } });
    return count > 0;
  }

  async existsByRefreshToken(refreshToken: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.token.count({ where: { refreshToken } });
    return count > 0;
  }
}
