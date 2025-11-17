'use client';
import { useEffect, useState, useRef } from 'react';
import {
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  Query,
  DocumentData,
  QuerySnapshot,
  FirestoreError,
} from 'firebase/firestore';

interface Doc<T> {
  id: string;
  data: T;
}

const getDocsFromSnapshot = <T>(snapshot: QuerySnapshot<DocumentData>) => {
  const docs: Doc<T>[] = [];
  snapshot.forEach((doc) => {
    docs.push({ id: doc.id, data: doc.data() as T });
  });
  return docs;
};

export const useCollection = <T,>(q: Query<DocumentData> | null) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs: any[] = [];
        snapshot.forEach((doc) => {
          docs.push({ ...doc.data(), id: doc.id });
        });
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [q]);

  return { data, loading, error };
};
