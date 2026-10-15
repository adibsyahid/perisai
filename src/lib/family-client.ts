"use client";

// Live family data for this phone, read straight from Firestore
// (Security Rules only return what belongs to this user).
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, type DocumentData, type Query } from "firebase/firestore";
import { get, set } from "idb-keyval";
import { clientDb, ensureUser } from "./firebase-client";
import type { Alert, Guardianship } from "./family-types";

export type FamilyData = {
  ready: boolean;
  guardians: Guardianship[]; // people who look after me
  protecting: Guardianship[]; // people I look after
  alerts: Alert[]; // alerts about people I look after, newest first
};

const EMPTY: FamilyData = { ready: false, guardians: [], protecting: [], alerts: [] };

export function useFamily(): FamilyData {
  const [data, setData] = useState<FamilyData>(EMPTY);

  useEffect(() => {
    let stops: (() => void)[] = [];
    let cancelled = false;

    ensureUser().then((user) => {
      if (cancelled) return;
      const db = clientDb();
      const watch = <T,>(q: Query<DocumentData>, key: keyof Omit<FamilyData, "ready">) =>
        onSnapshot(
          q,
          (snap) => {
            const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
            if (key === "alerts") (rows as Alert[]).sort((a, b) => b.createdAt - a.createdAt);
            setData((prev) => ({ ...prev, ready: true, [key]: rows }));
          },
          () => setData((prev) => ({ ...prev, ready: true })), // offline or rules: show what we have
        );

      stops = [
        watch<Guardianship>(query(collection(db, "guardianships"), where("protectedUid", "==", user.uid)), "guardians"),
        watch<Guardianship>(query(collection(db, "guardianships"), where("guardianUid", "==", user.uid)), "protecting"),
        watch<Alert>(query(collection(db, "alerts"), where("guardianUids", "array-contains", user.uid)), "alerts"),
      ];
    });

    return () => {
      cancelled = true;
      stops.forEach((stop) => stop());
    };
  }, []);

  return data;
}

// The phone number for the [Call] button is saved ONLY on the guardian's phone
// (BLUEPRINT F3), keyed by the protected person's uid.
const PHONES_KEY = "perisai.phones";

export async function getPhones(): Promise<Record<string, string>> {
  try {
    return (await get<Record<string, string>>(PHONES_KEY)) ?? {};
  } catch {
    return {};
  }
}

export async function savePhone(protectedUid: string, phone: string) {
  const phones = await getPhones();
  await set(PHONES_KEY, { ...phones, [protectedUid]: phone.replace(/[^\d+]/g, "") });
}
