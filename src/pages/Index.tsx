
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import AboutSection from '@/components/AboutSection';
import CoursesSection from '@/components/CoursesSection';
import CommitmentsSection from '@/components/CommitmentsSection';
import ActivitiesSection from '@/components/ActivitiesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import RegistrationForm from '@/components/RegistrationForm';
import ContactSection from '@/components/ContactSection';
import ChatBox from '@/components/ChatBox';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroCarousel />
      <AboutSection />
      <CoursesSection />
      <CommitmentsSection />
      <ActivitiesSection />
      <TestimonialsSection />
      <RegistrationForm />
      <ContactSection />
      <ChatBox />
      <Footer />
    </div>
  );
};

export default Index;
