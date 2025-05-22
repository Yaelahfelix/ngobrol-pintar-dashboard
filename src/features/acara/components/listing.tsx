import { Product } from '@/types/acara';
import { searchParamsCache } from '@/lib/searchparams';
import { ProductTable } from './tables';
import { columns } from './tables/columns';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  orderBy,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import { auth } from '@clerk/nextjs/server';
import { DataTable } from '@/components/dataTable';

type ProductListingPage = {};

export default async function ProductListingPage({}: ProductListingPage) {
  const { userId } = await auth();
  const q = query(collection(db, 'acara'), where('userId', '==', userId));
  const snapshot = await getDocs(q);

  const allDocs = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      tanggal:
        data.tanggal instanceof Timestamp
          ? new Date(data.tanggal.toDate().toISOString())
          : null
    };
  }) as Product[];
  return <DataTable columns={columns} data={allDocs} />;
}
