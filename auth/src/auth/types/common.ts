export type AuthResponse = {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role: string;
};

export type TokenUser = {
  id: number;
  email: string;
  role_id: number;
  role?: string;
  Role?: {
    name: string;
  };
};
