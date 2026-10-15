// Firestore document shapes for Penjaga Keluarga (BLUEPRINT F3 and section 7).
import type { ScamType, Verdict } from "./scan-types";

export type Locale = "ms" | "en";

// users/{uid}: written by the owner's phone.
export type UserProfile = { name: string; state: string; locale: Locale };

// guardianships/{id}: written by the server when a code is accepted.
export type Guardianship = {
  id: string;
  protectedUid: string;
  protectedName: string;
  guardianUid: string;
  guardianName: string;
  createdAt: number;
};

// alerts/{id}: written by the server. No message content, ever.
export type Alert = {
  id: string;
  protectedUid: string;
  protectedName: string;
  guardianUids: string[];
  verdict: Verdict;
  scamType: ScamType;
  headline: string;
  riskScore: number;
  createdAt: number;
  handled: boolean;
};

// What the server needs from a scan to raise an alert.
export type AlertInput = Pick<Alert, "verdict" | "scamType" | "headline" | "riskScore">;
