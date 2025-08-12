import React from 'react';
import { Header } from '@/components/Header';
import { Navbar } from '@/components/Navbar';
import { AuthCard } from '@/components/AuthCard';
import { QuickActions } from '@/components/QuickActions';
import { HowItWorksCard } from '@/components/HowItWorksCard';
import { FeaturesSection } from '@/components/FeaturesSection';
import { EcosystemSection } from '@/components/EcosystemSection';
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
          <video 
            className="w-full h-auto object-cover" 
            src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/sign/criativos/videobanner3.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTk4Mzc3ZS0wZjU2LTQxYTItOGZhZS04OTFkM2ZlNzc5NmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjcmlhdGl2b3MvdmlkZW9iYW5uZXIzLm1wNCIsImlhdCI6MTc1NTAzMTI1NSwiZXhwIjoxNzg2NTY3MjU1fQ.qesagYqv_VBSiWMLwA1sJlZ4Icd2bWworRJDK_c8aj0"
            autoPlay 
            muted 
            loop 
            playsInline
            preload="metadata"
            poster="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/sign/criativos/banner%20superior%203.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTk4Mzc3ZS0wZjU2LTQxYTItOGZhZS04OTFkM2ZlNzc5NmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjcmlhdGl2b3MvYmFubmVyIHN1cGVyaW9yIDMucG5nIiwiaWF0IjoxNzUyMTcyMTk3LCJleHAiOjE3ODM3MDgxOTd9.tak4txDNXmPTZFMpkiy5hIHYMjS-e1pRKSVZ-53NpqQ"
          >
            Seu navegador não suporta reprodução de vídeo.
          </video>
        </div>
        
        <div className="container mx-auto py-0 px-[13px]">
          <Header />
          
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Auth Card */}
            <AuthCard />
            
            {/* Quick Actions for logged users */}
            <QuickActions />
            
            {/* How It Works Card */}
            <HowItWorksCard />
            
            {/* Features Section */}
            <FeaturesSection />
            
            {/* Ecosystem Section */}
            <EcosystemSection />
            
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