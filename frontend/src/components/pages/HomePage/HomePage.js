import React from 'react';
import './HomePage.css';
import HeroSection from '../../organisms/HeroSection/HeroSection';
import TrustBadges from '../../organisms/TrustBadges/TrustBadges';
import ProductsSection from '../../organisms/ProductsSection/ProductsSection';
import CategoryCircles from '../../organisms/CategoryCircles/CategoryCircles';
import AboutBanner from '../../organisms/AboutBanner/AboutBanner';

const HomePage = ({ onAddToCart }) => {

  return (
    <div className="home-page" dir="rtl">
      <HeroSection />
      <TrustBadges />
      <ProductsSection  onAddToCart={onAddToCart} />
      <CategoryCircles />
      <AboutBanner />
    </div>
  );
};

export default HomePage;