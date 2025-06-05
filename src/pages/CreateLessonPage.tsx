import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpen, GraduationCap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ClassDetail {
  id: string;
  name: string;
  course: {
    name: string;
  };
}

const CreateLessonPage = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [nextLessonNumber, setNextLessonNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (classId) {
      fetchClassDetail();
      fetchNextLessonNumber();
    }
  }, [classId]);

  const fetchClassDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          courses (
            name
          )
        `)
        .eq('id', classId)
        .single();

      if (error) throw error;

      setClassDetail({
        id: data.id,
        name: data.name,
        course: data.courses || { name: 'Không xác định' }
      });
    } catch (error) {
      console.error('Error fetching class detail:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin lớp học",
        variant: "destructive",
      });
    } finally {
      setPageLoading(false);
    }
  };

  const fetchNextLessonNumber = async () => {
    try {
      const { data: maxLessonData, error: maxLessonError } = await supabase
        .from('lessons')
        .select('lesson_number')
        .eq('class_id', classId)
        .order('lesson_number', { ascending: false })
        .limit(1);

      if (maxLessonError) throw maxLessonError;

      const next = maxLessonData && maxLessonData.length > 0
        ? maxLessonData[0].lesson_number + 1
        : 1;

      setNextLessonNumber(next);
    } catch (error) {
      console.error('Error fetching next lesson number:', error);
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
    if (!formData.title || !formData.content) {
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
        .insert({
          class_id: classId,
          title: formData.title,
          content: formData.content,
          lesson_number: nextLessonNumber,
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Thành công",
        description: "Đã thêm buổi học mới",
        className: "bg-green-50 border-green-200 text-green-900",
      });

      navigate(`/teacher/class/${classId}`);
    } catch (error: any) {
      console.error('Error creating lesson:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm buổi học",
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
          <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b sticky top-0 z-50">
        <div className={`mx-auto px-4 ${isMobile ? 'max-w-full' : 'max-w-6xl sm:px-6 lg:px-8 xl:px-12'}`}>
          <div className={`flex items-center ${isMobile ? 'h-16 space-x-3' : 'h-20 space-x-4'}`}>
            <Button 
              onClick={() => navigate(`/teacher/class/${classId}`)}
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              className="hover:bg-indigo-50 border-indigo-200 text-indigo-700 flex-shrink-0"
            >
              <ArrowLeft className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${isMobile ? '' : 'mr-2'}`} />
              {!isMobile && "Quay lại lớp học"}
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className={`font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ${isMobile ? 'text-lg' : 'text-4xl xl:text-5xl'}`}>
                Thêm buổi học
              </h1>
              {classDetail && (
                <p className={`text-gray-600 mt-1 truncate ${isMobile ? 'text-sm' : 'text-lg xl:text-xl'}`}>
                  {classDetail.name} - {classDetail.course.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`mx-auto px-4 py-6 ${isMobile ? 'max-w-full' : 'max-w-4xl xl:max-w-5xl sm:px-6 lg:px-8 xl:px-12 py-8 xl:py-12'}`}>
        <Card className={`shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden ${isMobile ? 'rounded-lg' : 'rounded-xl'}`}>
          <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-500 text-white relative">
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
                  <BookOpen className={`text-white ${isMobile ? 'w-5 h-5' : 'w-8 h-8 xl:w-10 xl:h-10'}`} />
                </div>
                <div>
                  <CardTitle className={`font-bold ${isMobile ? 'text-lg' : 'text-3xl xl:text-4xl'}`}>Buổi học số {nextLessonNumber}</CardTitle>
                  <CardDescription className={`text-violet-100 ${isMobile ? 'text-sm' : 'text-lg xl:text-xl'}`}>
                    Tạo buổi học mới cho lớp
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
                  required
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
                  onClick={() => navigate(`/teacher/class/${classId}`)}
                  disabled={loading}
                  className={`${isMobile ? 'w-full h-11 text-base' : 'flex-1 h-14 xl:h-16 text-lg xl:text-xl'}`}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.title || !formData.content}
                  className={`bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 ${isMobile ? 'w-full h-11 text-base' : 'flex-1 h-14 xl:h-16 text-lg xl:text-xl'}`}
                >
                  {loading ? "Đang xử lý..." : "Tạo buổi học"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateLessonPage; 