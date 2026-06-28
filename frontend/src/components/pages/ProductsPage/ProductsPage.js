import React from "react";
import { useSearchParams } from "react-router-dom";
import ProductsContent from "../../organisms/ProductsContent/ProductsContent";
import CategoriesTabs from "../../organisms/CategoriesTabs/CategoriesTabs";

export default function ProductsPage({ onAddToCart }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || 'all';
  const searchQuery = searchParams.get("search") || '';

  const handleCategoryChange = (newCategory) => {
    if (newCategory === 'all') {
      searchParams.delete("category");
    } else {
      searchParams.set("category", newCategory);
    }
    setSearchParams(searchParams);
  };

  return (
    <>
      <CategoriesTabs
        activeCategory={activeCategory}
        setActiveCategory={handleCategoryChange}
      />
      <ProductsContent
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onAddToCart={onAddToCart}
      />
    </>
  );
}