import { RoleEntity } from "./entities/role.entity.js";
import { RoleCreateDto } from "./dto/request/role-create.dto.js";

export const ROLE_SERVICE = "IRoleService";

export interface IRoleService {
  create(payload: RoleCreateDto): Promise<RoleEntity>;
  getById(id: string): Promise<RoleEntity>;
  getByName(name: string): Promise<RoleEntity>;
  findAll(): Promise<RoleEntity[]>;
}
