import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const BearerToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"] || "";
    return authHeader.replace(/^Bearer\s+/i, "").trim();
  },
);
