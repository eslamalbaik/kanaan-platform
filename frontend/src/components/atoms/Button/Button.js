import React from 'react';
import './Button.css';

export default function Button({
  children,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  icon: Icon,
  className = "",
}) {

  const Component = href ? 'a' : 'button';

  return (
    <Component
      href={href}
      onClick={onClick}
      type={!href ? type : undefined}
      className={`btn-atom ${variant} ${className}`}
    >
      {Icon && <Icon size={20} />}
      {children}
    </Component>
  );
}