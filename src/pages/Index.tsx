
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import CoursesSection from '@/components/CoursesSection';
import CommitmentsSection from '@/components/CommitmentsSection';
import AboutSection from '@/components/AboutSection';
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
      <CoursesSection />
      <CommitmentsSection />
      <AboutSection />
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
