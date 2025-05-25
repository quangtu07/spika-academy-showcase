
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import UserAvatar from './UserAvatar';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Trang chủ', href: '#home' },
    { name: 'Giới thiệu', href: '#about' },
    { name: 'Khóa học', href: '#courses' },
    { name: 'Hoạt động', href: '#activities' },
    { name: 'Liên hệ', href: '#contact' },
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

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    
    // If user is admin, redirect to admin dashboard
    if (user.role === 'admin') {
      navigate('/admin');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // If currently on admin page, redirect to home
    if (window.location.pathname === '/admin') {
      navigate('/');
    }
  };

  const handleAdminAccess = () => {
    navigate('/admin');
  };

  return (
    <>
      <nav className="bg-white shadow-lg fixed w-full top-0 z-50 font-roboto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Spika</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  {item.name}
                </a>
              ))}
              
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  {currentUser.role === 'admin' && (
                    <Button 
                      onClick={handleAdminAccess}
                      variant="outline"
                      className="text-primary-600 border-primary-600 hover:bg-primary-50"
                    >
                      Quản lý
                    </Button>
                  )}
                  <UserAvatar user={currentUser} onLogout={handleLogout} />
                </div>
              ) : (
                <Button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2"
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
                  <a
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="px-3 py-2">
                  {currentUser ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <UserAvatar user={currentUser} onLogout={handleLogout} />
                        <span className="text-sm text-gray-700">{currentUser.fullname}</span>
                      </div>
                      {currentUser.role === 'admin' && (
                        <Button 
                          onClick={() => {
                            handleAdminAccess();
                            setIsMenuOpen(false);
                          }}
                          variant="outline"
                          className="w-full text-primary-600 border-primary-600 hover:bg-primary-50"
                        >
                          Quản lý
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button 
                      onClick={() => {
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
