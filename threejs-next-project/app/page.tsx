// pages/index.tsx
"use client"
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the ThreeScene component to disable SSR
const ThreeScene = dynamic(() => import('../components/ThreeScene'), { ssr: false });

const Home: React.FC = () => {
  return (
    <div>
      <h1>Three.js with Next.js and TypeScript</h1>
      <ThreeScene />
    </div>
  );
};

export default Home;
