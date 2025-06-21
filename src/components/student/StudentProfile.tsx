import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Calendar, GraduationCap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const StudentProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser) {
      setProfile(currentUser);
    }
    setIsLoading(false);
  };

  const getInitials = (fullname: string) => {
    if (!fullname) return 'U';
    return fullname
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02458b]"></div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Profile Header Card */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-[#02458b] text-white">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-4 border-white/20">
                <AvatarImage src={profile?.avatar_url} alt={profile?.fullname} />
                <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                  {getInitials(profile?.fullname || profile?.username)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg truncate">{profile?.fullname || profile?.username}</CardTitle>
                <CardDescription className="text-white/80 text-sm truncate">{profile?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Details */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-[#02458b]" />
              <span>Thông tin cá nhân</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-[#02458b]/5 rounded-lg">
                <User className="h-5 w-5 text-[#02458b] flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Họ và tên</p>
                  <p className="text-gray-900 truncate">{profile?.fullname || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-[#02458b]/5 rounded-lg">
                <Mail className="h-5 w-5 text-[#02458b] flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900 truncate">{profile?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-[#02458b]/5 rounded-lg">
                <Phone className="h-5 w-5 text-[#02458b] flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Số điện thoại</p>
                  <p className="text-gray-900 truncate">{profile?.phone_number || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-[#02458b]/5 rounded-lg">
                <Calendar className="h-5 w-5 text-[#02458b] flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Tuổi</p>
                  <p className="text-gray-900">{profile?.age || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#02458b]">Thông tin cá nhân</h2>
        <p className="text-gray-600 mt-2 text-lg">Thông tin tài khoản của bạn</p>
      </div>

      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-[#02458b] text-white">
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20 border-4 border-white/20">
              <AvatarImage src={profile?.avatar_url} alt={profile?.fullname} />
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                {getInitials(profile?.fullname || profile?.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{profile?.fullname || profile?.username}</CardTitle>
              <CardDescription className="text-white/80 text-lg mt-1">{profile?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <div className="p-6 bg-[#02458b]/5 rounded-xl border border-[#02458b]/20">
                <div className="flex items-center space-x-3 mb-3">
                  <User className="h-6 w-6 text-[#02458b]" />
                  <h3 className="text-lg font-semibold text-gray-900">Họ và tên</h3>
                </div>
                <p className="text-xl text-gray-700">{profile?.fullname || 'Chưa cập nhật'}</p>
              </div>

              <div className="p-6 bg-[#02458b]/5 rounded-xl border border-[#02458b]/20">
                <div className="flex items-center space-x-3 mb-3">
                  <Phone className="h-6 w-6 text-[#02458b]" />
                  <h3 className="text-lg font-semibold text-gray-900">Số điện thoại</h3>
                </div>
                <p className="text-xl text-gray-700">{profile?.phone_number || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-[#02458b]/5 rounded-xl border border-[#02458b]/20">
                <div className="flex items-center space-x-3 mb-3">
                  <Mail className="h-6 w-6 text-[#02458b]" />
                  <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                </div>
                <p className="text-xl text-gray-700">{profile?.email}</p>
              </div>

              <div className="p-6 bg-[#02458b]/5 rounded-xl border border-[#02458b]/20">
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar className="h-6 w-6 text-[#02458b]" />
                  <h3 className="text-lg font-semibold text-gray-900">Tuổi</h3>
                </div>
                <p className="text-xl text-gray-700">{profile?.age || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfile;
