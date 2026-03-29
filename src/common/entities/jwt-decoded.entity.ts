import { RoleName } from "../enums/index.js";

export class JwtDecodedEntity {
  userId: string;
}

export class JwtPayloadWithAuth extends JwtDecodedEntity {
  adminId?: string;
  barberId?: string;
  customerId?: string;
  barbershopId?: string;

  loggedInAs: RoleName;
  roles: string[];
  permissions: string[];
}

export class JwtRefreshPayloadWithAuth extends JwtDecodedEntity {
  loggedInAs: RoleName;
}
