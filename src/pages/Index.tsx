
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import AboutSection from '@/components/AboutSection';
import CoursesSection from '@/components/CoursesSection';
import CommitmentsSection from '@/components/CommitmentsSection';
import ActivitiesSection from '@/components/ActivitiesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import RegistrationModal from '@/components/RegistrationModal';

const Index = () => {
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="animate-fade-in">
        <HeroCarousel onOpenRegistrationModal={() => setIsRegistrationModalOpen(true)} />
      </div>
      <div className="animate-fade-in animation-delay-200">
        <AboutSection />
      </div>
      <div className="animate-fade-in animation-delay-400">
        <CoursesSection onOpenRegistrationModal={() => setIsRegistrationModalOpen(true)} />
      </div>
      <div className="animate-fade-in animation-delay-600">
        <CommitmentsSection />
      </div>
      <div className="animate-fade-in animation-delay-800">
        <ActivitiesSection />
      </div>
      <div className="animate-fade-in animation-delay-1000">
        <TestimonialsSection />
      </div>
      <div className="animate-fade-in animation-delay-1200">
        <ContactSection />
      </div>
      <Footer />
      <RegistrationModal 
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
      />
    </div>
  );
};

export default Index;
