'use client';

import ProductForm from './form';

type TProductViewPageProps = {
  productId: string;
};

export default function ProductViewPage({ productId }: TProductViewPageProps) {
  let product = null;
  let pageTitle = 'Buat Acara Baru';

  // if (productId !== 'new') {
  //   const data = await fakeProducts.getProductById(Number(productId));
  //   product = data.product as Product;
  //   if (!product) {
  //     notFound();
  //   }
  //   pageTitle = `Edit Product`;
  // }

  return <ProductForm initialData={product} pageTitle={pageTitle} />;
}
