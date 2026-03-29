import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      return response.status(status).json(exceptionResponse);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = this.handlePrismaError(exception);
      const errorResponse = {
        status: "ERROR",
        message: prismaError.message,
        ...(process.env.NODE_ENV !== "production" && {
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          stack: exception.stack,
        }),
      };
      return response.status(prismaError.status).json(errorResponse);
    }

    if (exception instanceof Error) {
      const errorResponse = {
        status: "ERROR",
        message: exception.message || "Internal server error",
        ...(process.env.NODE_ENV !== "production" && {
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          stack: exception.stack,
        }),
      };
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(errorResponse);
    }

    const errorResponse = {
      status: "ERROR",
      message: "Internal server error",
      ...(process.env.NODE_ENV !== "production" && {
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      }),
    };
    return response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }

  private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
  } {
    switch (exception.code) {
      case "P2002": {
        const target = exception.meta?.target as string[];
        const field = target ? target.join(", ") : "field";
        return {
          status: HttpStatus.CONFLICT,
          message: `${this.formatFieldName(field)} already exists`,
        };
      }
      case "P2003": {
        const field = exception.meta?.field_name as string;
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `Invalid reference: ${field || "related record"} does not exist`,
        };
      }
      case "P2025": {
        return {
          status: HttpStatus.NOT_FOUND,
          message: "Record not found",
        };
      }
      case "P2014": {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Required relation is missing",
        };
      }
      case "P2011": {
        const field = exception.meta?.constraint as string;
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `${this.formatFieldName(field)} is required`,
        };
      }
      case "P2016": {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Invalid query parameters",
        };
      }
      default: {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Database error occurred",
        };
      }
    }
  }

  private formatFieldName(field: string): string {
    if (!field) return "Field";
    return field
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
}
