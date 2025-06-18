import React from 'react';
import { Header } from '@/components/Header';
import { Navbar } from '@/components/Navbar';
import { AuthCard } from '@/components/AuthCard';
const Index = () => {
  return <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary font-inter pt-16">
        {/* Banner Section */}
        <div className="mb-12 animate-fade-in">
          <img alt="Banner FoodScan & Diet" className="w-full h-auto object-cover" src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/sign/criativos/banner%20superior.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTk4Mzc3ZS0wZjU2LTQxYTItOGZhZS04OTFkM2ZlNzc5NmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjcmlhdGl2b3MvYmFubmVyIHN1cGVyaW9yLnBuZyIsImlhdCI6MTc1MDIzNTAyMSwiZXhwIjoxNzgxNzcxMDIxfQ.gmmffCn73T_2hVE7fxQNEkTdonyjwyFX_aJ8NKkjIrY" />
        </div>
        
        <div className="container mx-auto px-4 py-0">
          <Header />
          
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Auth Card */}
            <AuthCard />
          </div>
        </div>
      </div>
    </>;
};
export default Index;