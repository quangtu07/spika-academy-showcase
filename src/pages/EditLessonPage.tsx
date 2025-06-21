import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, GraduationCap, Edit } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import TeacherToolbar from '@/components/teacher/TeacherToolbar';
import NotificationBell from '@/components/teacher/NotificationBell';

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  lesson_number: number;
  class: {
    id: string;
    name: string;
    course: {
      name: string;
    };
  };
}

const EditLessonPage = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (lessonId) {
      fetchLessonDetail();
    }
  }, [lessonId]);

  useEffect(() => {
    // Get teacherId from localStorage
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      setTeacherId(currentUser?.id || null);
    }
  }, []);

  const fetchLessonDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          content,
          lesson_number,
          classes (
            id,
            name,
            courses (
              name
            )
          )
        `)
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      const lessonData = {
        id: data.id,
        title: data.title,
        content: data.content,
        lesson_number: data.lesson_number,
        class: {
          id: data.classes?.id || '',
          name: data.classes?.name || 'Không xác định',
          course: {
            name: data.classes?.courses?.name || 'Không xác định'
          }
        }
      };

      setLesson(lessonData);
      setFormData({
        title: lessonData.title,
        content: lessonData.content || '',
      });
    } catch (error) {
      console.error('Error fetching lesson detail:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin buổi học",
        variant: "destructive",
      });
      navigate(-1);
    } finally {
      setPageLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !lesson) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          title: formData.title,
          content: formData.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', lesson.id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã cập nhật buổi học",
        className: "bg-green-50 border-green-200 text-green-900",
      });

      navigate(`/teacher/class/${lesson.class.id}`);
    } catch (error: any) {
      console.error('Error updating lesson:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật buổi học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#02458b] rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-lg">
            <Edit className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02458b] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải thông tin buổi học...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="text-center p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy buổi học</h3>
            <Button onClick={() => navigate(-1)} className="w-full">
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <TeacherToolbar 
        title="Chỉnh sửa buổi học"
        subtitle={`${lesson.class.name} - ${lesson.class.course.name}`}
        rightContent={<NotificationBell teacherId={teacherId} />}
      />

      {/* Main Content */}
      <div className={`mx-auto px-4 py-6 ${isMobile ? 'max-w-full' : 'max-w-4xl xl:max-w-5xl sm:px-6 lg:px-8 xl:px-12 py-8 xl:py-12'}`}>
        <Card className={`shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden ${isMobile ? 'rounded-lg' : 'rounded-xl'}`}>
          <CardHeader className="bg-[#02458b] text-white relative">
            <div className="absolute inset-0 bg-black/10"></div>
            {!isMobile && (
              <>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/5 rounded-full"></div>
              </>
            )}
            
            <div className="relative z-10">
              <div className={`flex items-center mb-4 ${isMobile ? 'space-x-3' : 'space-x-4'}`}>
                <div className={`bg-white/20 rounded-xl flex items-center justify-center ${isMobile ? 'w-10 h-10' : 'w-16 h-16 xl:w-20 xl:h-20'}`}>
                  <Edit className={`text-white ${isMobile ? 'w-5 h-5' : 'w-8 h-8 xl:w-10 xl:h-10'}`} />
                </div>
                <div>
                  <CardTitle className={`font-bold ${isMobile ? 'text-lg' : 'text-3xl xl:text-4xl'}`}>
                    Buổi học số {lesson.lesson_number}
                  </CardTitle>
                  <CardDescription className={`text-white/80 ${isMobile ? 'text-sm' : 'text-lg xl:text-xl'}`}>
                    Chỉnh sửa thông tin buổi học
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className={isMobile ? 'p-4' : 'p-8 xl:p-12'}>
            <form onSubmit={handleSubmit} className={isMobile ? 'space-y-4' : 'space-y-8 xl:space-y-10'}>
              <div className={isMobile ? 'space-y-2' : 'space-y-4 xl:space-y-5'}>
                <Label htmlFor="title" className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-xl xl:text-2xl'}`}>
                  Tiêu đề buổi học
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Nhập tiêu đề buổi học"
                  required
                  className={isMobile ? 'h-11 text-base' : 'h-14 xl:h-16 text-lg xl:text-xl'}
                />
              </div>

              <div className={isMobile ? 'space-y-2' : 'space-y-4 xl:space-y-5'}>
                <Label htmlFor="content" className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-xl xl:text-2xl'}`}>
                  Nội dung buổi học
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Nhập nội dung chi tiết của buổi học"
                  rows={isMobile ? 6 : 8}
                  className={`resize-none ${isMobile ? 'text-base' : 'text-lg xl:text-xl'}`}
                />
                <p className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-base xl:text-lg'}`}>
                  Mô tả chi tiết nội dung và mục tiêu của buổi học này
                </p>
              </div>

              <div className={`flex gap-3 ${isMobile ? 'pt-4 flex-col-reverse' : 'gap-6 xl:gap-8 pt-8 xl:pt-10'}`}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/teacher/class/${lesson.class.id}`)}
                  disabled={loading}
                  className={`${isMobile ? 'w-full h-11 text-base' : 'flex-1 h-14 xl:h-16 text-lg xl:text-xl'}`}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.title}
                  className={`bg-[#02458b] hover:bg-[#02458b]/90 ${isMobile ? 'w-full h-11 text-base' : 'flex-1 h-14 xl:h-16 text-lg xl:text-xl'}`}
                >
                  {loading ? "Đang xử lý..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditLessonPage; 