import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { JwtPayloadWithAuth } from "../entities/index.js";
import { RoleName } from "../enums/index.js";

@Injectable()
export class BarbershopOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: JwtPayloadWithAuth = request.user;

    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    // SUPER_ADMIN bypasses ownership check
    if (user.roles.includes(RoleName.SUPER_ADMIN)) {
      return true;
    }

    // For barbershop owners, compare JWT barbershopId with resource barbershopId
    const resourceBarbershopId =
      request.params.barbershopId ||
      request.params.id ||
      request.body.barbershopId;

    if (
      user.roles.includes(RoleName.BARBERSHOP_OWNER) &&
      user.barbershopId &&
      user.barbershopId === resourceBarbershopId
    ) {
      return true;
    }

    throw new ForbiddenException(
      "You do not have access to this barbershop resource",
    );
  }
}
