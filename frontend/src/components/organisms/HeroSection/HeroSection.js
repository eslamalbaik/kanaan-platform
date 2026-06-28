import React from 'react';
import { ShoppingCart } from "lucide-react";
import Button from '../../atoms/Button/Button';
import HeroContent from '../../molecules/HeroContent/HeroContent';
import './HeroSection.css';

export default function HeroSection() {
  return (
    <section id="home" className="hero-container">
      <div className="hero-overlay" />

      <div className="hero-inner-content">
        <HeroContent 
          title={{ main: "ادعم التراث", accent: "الفلسطيني" }}
          description="كل منتج حكاية... اكتشف جمال المنتجات الفلسطينية الأصيلة وادعم العائلات المنتجة في غزة."
        />
        
        <div className="hero-actions">
          <Button href="#products" variant="primary" icon={ShoppingCart}>
            تسوق الآن
          </Button>
          <Button href="#about" variant="secondary">
            من نحن
          </Button>
        </div>
      </div>
    </section>
  );
}
