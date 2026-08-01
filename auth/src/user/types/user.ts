import { User as PrismaUser } from '@prisma/client';

export type User = PrismaUser & {
  id: number;
  name: string;
  email: string;
  password: string;
  role_id: number;
  created_at: Date;
  Role?: {
    id: number;
    name: string;
    created_at: Date;
  };
};
