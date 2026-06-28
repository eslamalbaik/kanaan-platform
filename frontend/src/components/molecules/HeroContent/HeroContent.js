import React from 'react';
import './HeroContent.css';

export default function HeroContent({ title, description }) {
  return (
    <div className="hero-text-wrapper">
      <h1 className="hero-title">
        {title?.main} <br />
        <span className="highlight">{title.accent}</span>
      </h1>
      <p className="hero-description">{description}</p>
    </div>
  );
}

