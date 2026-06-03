import { MatchStage, MatchStatus, Role } from "@prisma/client";

// ─── Re-exportem els enums de Prisma ──────────────────────────────────────────
export { MatchStage, MatchStatus, Role };

// ─── Tipus del domini Champions ───────────────────────────────────────────────

export interface TeamWithStats {
  id: string;
  name: string;
  shortName: string;
  logo: string | null;
  country: string;
  group: string | null;
  // Estadístiques calculades
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface MatchWithTeams {
  id: string;
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
    logo: string | null;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
    logo: string | null;
  };
  homeScore: number | null;
  awayScore: number | null;
  matchDate: Date;
  stage: MatchStage;
  status: MatchStatus;
  venue: string | null;
}

// ─── Extensió de la sessió de NextAuth ────────────────────────────────────────
// Necessari per afegir 'role' i 'id' a Session.user

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
