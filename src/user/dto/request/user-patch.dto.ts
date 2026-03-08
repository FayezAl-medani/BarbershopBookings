import { PartialType } from '@nestjs/swagger';
import { UserCreateDto } from './user-create.dto.js';

export class UserPatchDto extends PartialType(UserCreateDto) {}
