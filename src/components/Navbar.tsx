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
  const [logoutMessage, setLogoutMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useUserRole();

  const menuItems = [
    { name: 'Trang chủ', href: '#home', action: () => handleNavigateHome() },
    { name: 'Giới thiệu', href: '#about', action: () => handleScrollToSection('about') },
    { name: 'Giảng viên', href: '/teachers', action: () => handleTeachersClick() },
    { name: 'Khóa học', href: '#courses', action: () => handleCoursesClick() },
    { name: 'Blog chia sẻ', href: '/blog', action: () => handleBlogClick() },
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

  const handleBlogClick = () => {
    navigate('/blog');
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
    localStorage.removeItem('currentUser');
    
    // Thông báo đăng xuất thành công
    setLogoutMessage('Đã đăng xuất thành công!');
    
    // Tự động ẩn message sau 3 giây
    setTimeout(() => {
      setLogoutMessage('');
    }, 3000);
    
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
      {/* Thông báo đăng xuất */}
      {logoutMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300">
          {logoutMessage}
        </div>
      )}

      <nav className={`fixed w-full top-0 z-50 font-roboto transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-white/20' 
          : 'bg-white/90 backdrop-blur-lg shadow-lg border-b border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Enhanced Logo */}
            <div 
              className="flex items-center cursor-pointer group relative" 
              onClick={handleNavigateHome}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500 scale-75"></div>
              <div className="relative w-24 h-24 -my-6">
                <img 
                  src="/images/logo.png" 
                  alt="Future Wings Academy Logo" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-all duration-300 drop-shadow-2xl"
                />
              </div>
              {/* <div className="flex flex-col">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Future Wings
                </div>
              </div> */}
            </div>

            {/* Enhanced Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {menuItems.map((item, index) => (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="relative px-4 py-2 text-gray-700 hover:text-[#02458b] font-medium transition-all duration-300 rounded-xl hover:bg-[#02458b]/5 group"
                >
                  <span className="relative z-10">{item.name}</span>
                  <div className="absolute inset-0 scale-0 group-hover:scale-100 bg-[#02458b]/10 rounded-xl transition-transform duration-300"></div>
                </button>
              ))}
              
              {currentUser ? (
                <div className="flex items-center space-x-3 ml-6">
                  {userRole && ['admin', 'teacher', 'student'].includes(userRole) && (
                    <Button 
                      onClick={handleDashboardAccess}
                      className="relative overflow-hidden bg-[#02458b] hover:bg-[#02458b]/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                      <span className="relative z-10">{getDashboardButtonText()}</span>
                    </Button>
                  )}
                  <UserAvatar user={currentUser} onLogout={handleLogout} />
                </div>
              ) : (
                <div className="ml-6">
                  <Button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="relative overflow-hidden bg-[#1b4486] hover:bg-[#1b4486]/90 text-white px-6 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group border-0"
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
                className="relative w-10 h-10 rounded-xl bg-[#02458b]/5 hover:bg-[#02458b]/10 flex items-center justify-center transition-all duration-300 group shadow-lg"
              >
                <div className="space-y-1.5">
                  <div className={`w-5 h-0.5 bg-[#02458b] transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
                  <div className={`w-5 h-0.5 bg-[#02458b] transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
                  <div className={`w-5 h-0.5 bg-[#02458b] transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
                </div>
              </button>
            </div>
          </div>

          {/* Enhanced Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-white/20">
              <div className="px-2 pt-4 pb-6 space-y-2 bg-gradient-to-br from-white/95 via-blue-50/50 to-indigo-50/50 backdrop-blur-xl rounded-b-2xl">
                {menuItems.map((item, index) => (
                                      <button
                      key={item.name}
                      onClick={() => {
                        item.action();
                        setIsMenuOpen(false);
                      }}
                      className="flex w-full text-left px-4 py-3 text-gray-700 hover:text-[#02458b] font-medium rounded-xl hover:bg-[#02458b]/5 transition-all duration-300"
                    >
                    {item.name}
                  </button>
                ))}
                <div className="pt-4 px-4 border-t border-white/30">
                  {currentUser ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-[#02458b]/5 rounded-xl backdrop-blur-sm">
                        <UserAvatar user={currentUser} onLogout={handleLogout} />
                        <span className="text-sm font-medium text-gray-700">{currentUser.fullname}</span>
                      </div>
                      {userRole && ['admin', 'teacher', 'student'].includes(userRole) && (
                        <Button 
                          onClick={() => {
                            handleDashboardAccess();
                            setIsMenuOpen(false);
                          }}
                          className="w-full bg-[#02458b] hover:bg-[#02458b]/90 text-white border-0 shadow-lg"
                        >
                          {getDashboardButtonText()}
                        </Button>
                      )}
                      <Button 
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-300"
                      >
                        Đăng xuất
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-[#1b4486] hover:bg-[#1b4486]/90 text-white shadow-lg border-0"
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
