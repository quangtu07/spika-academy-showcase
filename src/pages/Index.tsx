
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import AboutSection from '@/components/AboutSection';
import CoursesSection from '@/components/CoursesSection';
import CommitmentsSection from '@/components/CommitmentsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import BlogSection from '@/components/BlogSection';
import Footer from '@/components/Footer';
import RegistrationModal from '@/components/RegistrationModal';

const Index = () => {
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroCarousel onOpenRegistrationModal={() => setIsRegistrationModalOpen(true)} />
      <AboutSection />
      <CoursesSection onOpenRegistrationModal={() => setIsRegistrationModalOpen(true)} />
      <CommitmentsSection />
      <TestimonialsSection />
      <BlogSection />
      <Footer />
      <RegistrationModal 
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
      />
    </div>
  );
};

export default Index;
