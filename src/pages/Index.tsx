import React from 'react';
import { Header } from '@/components/Header';
import { Navbar } from '@/components/Navbar';
import { AuthCard } from '@/components/AuthCard';
import { FeaturesSection } from '@/components/FeaturesSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { FAQSection } from '@/components/FAQSection';
import { Footer } from '@/components/Footer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import PWAOfflineIndicator from '@/components/PWAOfflineIndicator';
const Index = () => {
  return <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary font-inter pt-16 py-[65px]">
        {/* Banner Section */}
        <div className="mb-12 animate-fade-in">
          <img alt="Banner FoodScan & Diet" className="w-full h-auto object-cover" src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/sign/criativos/banner%20superior%202.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTk4Mzc3ZS0wZjU2LTQxYTItOGZhZS04OTFkM2ZlNzc5NmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjcmlhdGl2b3MvYmFubmVyIHN1cGVyaW9yIDIucG5nIiwiaWF0IjoxNzUyMTcwMTcyLCJleHAiOjE3ODM3MDYxNzJ9.DgRPUWeYvwmcQl0vz2rIGufa8dpCYLyzwrKIwZnd--k" />
        </div>
        
        <div className="container mx-auto py-0 px-[13px]">
          <Header />
          
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Auth Card */}
            <AuthCard />
            
            {/* Features Section */}
            <FeaturesSection />
            
            {/* Testimonials Section */}
            <TestimonialsSection />
            
            {/* FAQ Section */}
            <FAQSection />
          </div>
        </div>
      </div>
      <Footer />
      <PWAInstallPrompt />
      <PWAOfflineIndicator />
    </>;
};
export default Index;