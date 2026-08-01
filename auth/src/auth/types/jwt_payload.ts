export type JwtPayload = {
  sub: number; // subject (unique user identifier): user_id in this case
  email?: string;
  role_id?: number; //
  role?: 'user' | 'admin';
  iat?: number; // issued at (timestamp)
  exp?: number; // expiration time (timestamp)

  permissions?: string[]; // granular permissions

  device?: string; // device type/identifier
  loginSource?: string; // how user logged in (web, mobile, etc.)
};
