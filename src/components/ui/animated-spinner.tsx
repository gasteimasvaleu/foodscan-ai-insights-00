import React from 'react';

interface AnimatedSpinnerProps {
  size?: string;
  className?: string;
}

export function AnimatedSpinner({ size = '10rem', className = '' }: AnimatedSpinnerProps) {
  return (
    <div
      className={`animated-spinner ${className}`}
      style={{ ['--size' as any]: size }}
      aria-hidden="true"
    />
  );
}

export default AnimatedSpinner;
