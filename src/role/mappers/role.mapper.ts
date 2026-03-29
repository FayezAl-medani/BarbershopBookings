import { Injectable } from "@nestjs/common";
import { Role } from "@prisma/client";
import { RoleEntity } from "../entities/role.entity.js";
import { RoleResponseDto } from "../dto/response/role-response.dto.js";

@Injectable()
export class RoleMapper {
  modelToEntity(model: Role): RoleEntity {
    return new RoleEntity({
      id: model.id,
      name: model.name,
      description: model.description,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  entityToResponseDto(entity: RoleEntity): RoleResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
    };
  }
}
