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
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useUserRole();

  const menuItems = [
    { name: 'Trang chủ', href: '#home', action: () => handleNavigateHome() },
    { name: 'Giới thiệu', href: '#about', action: () => handleScrollToSection('about') },
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isLoginModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLoginModalOpen]);

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
      case 'teacher': return 'Giảng viên';
      case 'student': return 'Học tập';
      default: return 'Dashboard';
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoginModalOpen(true);
  };

  return (
    <>
      <nav className="bg-white shadow-lg fixed w-full top-0 z-50 font-roboto transform-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleNavigateHome}>
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Spika</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  {item.name}
                </button>
              ))}
              
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  {userRole && ['admin', 'teacher', 'student'].includes(userRole) && (
                    <Button 
                      onClick={handleDashboardAccess}
                      variant="outline"
                      className="text-primary-600 border-primary-600 hover:bg-primary-50 min-w-fit"
                    >
                      {getDashboardButtonText()}
                    </Button>
                  )}
                  <UserAvatar user={currentUser} onLogout={handleLogout} />
                </div>
              ) : (
                <Button 
                  onClick={handleLoginClick}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 min-w-fit whitespace-nowrap"
                >
                  Đăng nhập
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-primary-600 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                {menuItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      item.action();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
                  >
                    {item.name}
                  </button>
                ))}
                <div className="px-3 py-2">
                  {currentUser ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <UserAvatar user={currentUser} onLogout={handleLogout} />
                        <span className="text-sm text-gray-700">{currentUser.fullname}</span>
                      </div>
                      {userRole && ['admin', 'teacher', 'student'].includes(userRole) && (
                        <Button 
                          onClick={() => {
                            handleDashboardAccess();
                            setIsMenuOpen(false);
                          }}
                          variant="outline"
                          className="w-full text-primary-600 border-primary-600 hover:bg-primary-50"
                        >
                          {getDashboardButtonText()}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button 
                      onClick={() => {
                        handleLoginClick;
                        setIsLoginModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white"
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
