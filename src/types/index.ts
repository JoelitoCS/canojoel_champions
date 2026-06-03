import { MatchStage, MatchStatus, Role } from "@prisma/client";

export { MatchStage, MatchStatus, Role };

// Extensió de la sessió de NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}
