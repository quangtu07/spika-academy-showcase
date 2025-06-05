import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, GraduationCap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Student {
  id: string;
  fullname: string;
  email: string;
}

interface ClassDetail {
  id: string;
  name: string;
  course: {
    name: string;
  };
}

const CreateEnrollmentPage = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    student_id: '',
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [enrolledStudentIds, setEnrolledStudentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (classId) {
      fetchClassDetail();
      fetchStudents();
      fetchEnrolledStudents();
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
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, fullname, email')
        .eq('role', 'student')
        .order('fullname');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách học viên",
        variant: "destructive",
      });
    } finally {
      setPageLoading(false);
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('class_id', classId);

      if (error) throw error;
      
      const enrolledIds = data?.map(enrollment => enrollment.student_id) || [];
      setEnrolledStudentIds(enrolledIds);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn học viên",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if enrollment already exists
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', formData.student_id)
        .eq('class_id', classId)
        .single();

      if (existingEnrollment) {
        toast({
          title: "Lỗi",
          description: "Học viên đã đăng ký lớp học này",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: formData.student_id,
          class_id: classId,
          status: 'active',
          enrolled_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã đăng ký lớp học thành công",
        className: "bg-green-50 border-green-200 text-green-900",
      });

      navigate(`/teacher/class/${classId}`);
    } catch (error) {
      console.error('Error creating enrollment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể đăng ký lớp học",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out already enrolled students
  const availableStudents = students.filter(student => !enrolledStudentIds.includes(student.id));

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
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
                Thêm học viên
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
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white relative">
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
                  <Users className={`text-white ${isMobile ? 'w-5 h-5' : 'w-8 h-8 xl:w-10 xl:h-10'}`} />
                </div>
                <div>
                  <CardTitle className={`font-bold ${isMobile ? 'text-lg' : 'text-3xl xl:text-4xl'}`}>Đăng ký học viên</CardTitle>
                  <CardDescription className={`text-emerald-100 ${isMobile ? 'text-sm' : 'text-lg xl:text-xl'}`}>
                    Thêm học viên mới vào lớp học
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className={isMobile ? 'p-4' : 'p-8 xl:p-12'}>
            {availableStudents.length === 0 ? (
              <div className={`text-center ${isMobile ? 'py-6' : 'py-8'}`}>
                <div className={`bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`}>
                  <Users className={`text-gray-400 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
                </div>
                <h3 className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-base' : 'text-xl xl:text-2xl'}`}>Không có học viên khả dụng</h3>
                <p className={`text-gray-500 mb-4 ${isMobile ? 'text-sm' : 'text-lg xl:text-xl'}`}>Tất cả học viên đã đăng ký lớp học này hoặc chưa có học viên nào trong hệ thống.</p>
                <Button 
                  onClick={() => navigate(`/teacher/class/${classId}`)}
                  className={`bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 ${isMobile ? 'w-full h-11 text-base' : 'h-12 text-lg'}`}
                >
                  Quay lại lớp học
                </Button>
              </div>
            ) : (
                              <form onSubmit={handleSubmit} className={isMobile ? 'space-y-4' : 'space-y-8 xl:space-y-10'}>
                <div className={isMobile ? 'space-y-2' : 'space-y-4 xl:space-y-5'}>
                  <Label htmlFor="student" className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-xl xl:text-2xl'}`}>
                    Chọn học viên
                  </Label>
                  <Select
                    value={formData.student_id}
                    onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                  >
                    <SelectTrigger className={isMobile ? 'h-11 text-base' : 'h-14 xl:h-16 text-lg xl:text-xl'}>
                      <SelectValue placeholder="Chọn học viên để đăng ký" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{student.fullname}</span>
                            <span className="text-sm text-gray-500">{student.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-base xl:text-lg'}`}>
                    Có {availableStudents.length} học viên khả dụng để đăng ký
                  </p>
                </div>

                <div className={`flex gap-3 ${isMobile ? 'pt-4 flex-col-reverse' : 'gap-6 xl:gap-8 pt-8 xl:pt-10'}`}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/teacher/class/${classId}`)}
                    disabled={isLoading}
                    className={`${isMobile ? 'w-full h-11 text-base' : 'flex-1 h-14 xl:h-16 text-lg xl:text-xl'}`}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.student_id}
                    className={`bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 ${isMobile ? 'w-full h-11 text-base' : 'flex-1 h-14 xl:h-16 text-lg xl:text-xl'}`}
                  >
                    {isLoading ? "Đang xử lý..." : "Đăng ký học viên"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEnrollmentPage; 