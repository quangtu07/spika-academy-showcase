import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import LoginModal from './LoginModal';
import UserAvatar from './UserAvatar';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useUserRole();

  const menuItems = [
    { name: 'Trang chủ', href: '#home', action: () => handleNavigateHome() },
    { name: 'Giới thiệu', href: '#about', action: () => handleScrollToSection('about') },
    { name: 'Giảng viên', href: '/teachers', action: () => handleTeachersClick() },
    { name: 'Khóa học', href: '#courses', action: () => handleCoursesClick() },
    { name: 'Hoạt động', href: '#activities', action: () => handleScrollToSection('activities') },
    { name: 'Liên hệ', href: '#contact', action: () => handleScrollToSection('contact') },
  ];

  // Check for existing user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigateHome = () => {
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const section = document.querySelector(`#${sectionId}`);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const section = document.querySelector(`#${sectionId}`);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleTeachersClick = () => {
    navigate('/teachers');
  };

  const handleCoursesClick = () => {
    navigate('/courses');
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    
    // Redirect based on role
    if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'teacher') {
      navigate('/teacher');
    } else if (user.role === 'student') {
      navigate('/student');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // If currently on dashboard pages, redirect to home
    if (['/admin', '/teacher', '/student'].includes(window.location.pathname)) {
      navigate('/');
    }
  };

  const handleDashboardAccess = () => {
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'teacher') {
      navigate('/teacher');
    } else if (userRole === 'student') {
      navigate('/student');
    }
  };

  const getDashboardButtonText = () => {
    switch (userRole) {
      case 'admin': return 'Quản lý';
      case 'teacher': return 'Quản lý lớp học';
      case 'student': return 'Học tập';
      default: return 'Dashboard';
    }
  };

  return (
    <>
      <nav className={`fixed w-full top-0 z-50 font-roboto transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-white/90 backdrop-blur-sm shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Enhanced Logo */}
            <div 
              className="flex items-center space-x-4 cursor-pointer group" 
              onClick={handleNavigateHome}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-xl tracking-wider">S</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary-400 to-purple-500 rounded-xl opacity-30 group-hover:opacity-50 blur transition-all duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-purple-600 bg-clip-text text-transparent">
                  Spika
                </span>
                <span className="text-xs text-gray-500 font-medium tracking-wide">
                  MC Academy
                </span>
              </div>
            </div>

            {/* Enhanced Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {menuItems.map((item, index) => (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="relative px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 group"
                >
                  <span className="relative z-10">{item.name}</span>
                  <div className="absolute inset-0 scale-0 group-hover:scale-100 bg-gradient-to-r from-primary-100 to-purple-100 rounded-lg transition-transform duration-300 opacity-50"></div>
                </button>
              ))}
              
              {currentUser ? (
                <div className="flex items-center space-x-3 ml-6">
                  {userRole && ['admin', 'teacher', 'student'].includes(userRole) && (
                    <Button 
                      onClick={handleDashboardAccess}
                      variant="outline"
                      className="relative overflow-hidden border-primary-200 text-primary-600 hover:text-white hover:border-primary-300 transition-all duration-300 group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                      <span className="relative z-10">{getDashboardButtonText()}</span>
                    </Button>
                  )}
                  <UserAvatar user={currentUser} onLogout={handleLogout} />
                </div>
              ) : (
                <div className="ml-6">
                  <Button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white px-6 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    <span className="relative z-10 font-medium">Đăng nhập</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Enhanced Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 hover:from-primary-50 hover:to-purple-50 flex items-center justify-center transition-all duration-300 group"
              >
                <div className="space-y-1.5">
                  <div className={`w-5 h-0.5 bg-gray-600 group-hover:bg-primary-600 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
                  <div className={`w-5 h-0.5 bg-gray-600 group-hover:bg-primary-600 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
                  <div className={`w-5 h-0.5 bg-gray-600 group-hover:bg-primary-600 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
                </div>
              </button>
            </div>
          </div>

          {/* Enhanced Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100">
              <div className="px-2 pt-4 pb-6 space-y-2 bg-gradient-to-br from-white via-gray-50 to-primary-50/30">
                {menuItems.map((item, index) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      item.action();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full text-left px-4 py-3 text-gray-700 hover:text-primary-600 font-medium rounded-lg hover:bg-gradient-to-r hover:from-white hover:to-primary-50 transition-all duration-300"
                  >
                    {item.name}
                  </button>
                ))}
                <div className="pt-4 px-4 border-t border-gray-200">
                  {currentUser ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-primary-50 rounded-lg">
                        <UserAvatar user={currentUser} onLogout={handleLogout} />
                        <span className="text-sm font-medium text-gray-700">{currentUser.fullname}</span>
                      </div>
                      {userRole && ['admin', 'teacher', 'student'].includes(userRole) && (
                        <Button 
                          onClick={() => {
                            handleDashboardAccess();
                            setIsMenuOpen(false);
                          }}
                          variant="outline"
                          className="w-full border-primary-200 text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50"
                        >
                          {getDashboardButtonText()}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button 
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      Đăng nhập
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Navbar;
