import { notFound } from 'next/navigation';
import { PRODUCTS, byId } from '@/lib/data';
import { ProductView } from '@/views/ProductView';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<'/product/[id]'>) {
  const { id } = await params;
  const p = byId[id];
  return { title: p ? `${p.name.en} · Fairuz Siam` : 'Fairuz Siam' };
}

export default async function Page({ params }: PageProps<'/product/[id]'>) {
  const { id } = await params;
  if (!byId[id]) notFound();
  return <ProductView id={id} />;
}
