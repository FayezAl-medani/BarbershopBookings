import {
  ExecutionContext,
  NotAcceptableException,
  createParamDecorator,
} from "@nestjs/common";
import { Request } from "express";

export type SortingParam = {
  property: string;
  direction: string;
};

export const SortingParams = createParamDecorator(
  (validParams, ctx: ExecutionContext): SortingParam | null => {
    const req: Request = ctx.switchToHttp().getRequest();
    const sort = req.query.sort as string;
    if (!sort) return null;

    if (typeof validParams != "object")
      throw new NotAcceptableException("Invalid sort parameter");

    const sortPattern = /^([a-zA-Z0-9]+):(asc|desc)$/;
    if (!sort.match(sortPattern))
      throw new NotAcceptableException(
        "Invalid sort parameter, allowed(asc|desc)",
      );

    const [property, direction] = sort.split(":");
    if (!validParams.includes(property))
      throw new NotAcceptableException(
        `Invalid sort property: ${property}, allowed: [${validParams}]`,
      );

    return { property, direction };
  },
);
