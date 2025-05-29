import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  name: string;
}

interface Instructor {
  id: string;
  fullname: string;
}

type ClassStatus = 'Đang hoạt động' | 'Đã kết thúc';

interface FormData {
  name: string;
  description: string;
  schedule: string;
  course_id: string;
  instructor_id: string;
  status: 'active' | 'inactive' | 'completed';
}

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData?: any;
  onSaved: () => void;
}

const ClassFormModal: React.FC<ClassFormModalProps> = ({ isOpen, onClose, classData, onSaved }) => {
  const [formData, setFormData] = useState({
    course_id: '',
    name: '',
    description: '',
    schedule: '',
    status: 'Đang hoạt động' as ClassStatus,
    instructor_id: '',
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
      fetchInstructors();
      if (classData) {
        setFormData({
          course_id: classData.course_id || '',
          name: classData.name || '',
          description: classData.description || '',
          schedule: classData.schedule || '',
          status: classData.status || 'Đang hoạt động',
          instructor_id: classData.instructor_id || '',
        });
      } else {
        setFormData({
          course_id: '',
          name: '',
          description: '',
          schedule: '',
          status: 'Đang hoạt động',
          instructor_id: '',
        });
      }
    }
  }, [isOpen, classData]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khóa học",
        variant: "destructive",
      });
    }
  };

  const fetchInstructors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, fullname')
        .eq('role', 'teacher')
        .order('fullname');

      if (error) throw error;
      setInstructors(data || []);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách giảng viên",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.course_id || !formData.instructor_id) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        course_id: formData.course_id,
        name: formData.name,
        description: formData.description || null,
        schedule: formData.schedule || null,
        status: formData.status,
        instructor_id: formData.instructor_id,
      };

      console.log('Submitting data:', submitData);

      let error;
      if (classData) {
        const { error: updateError } = await supabase
          .from('classes')
          .update(submitData)
          .eq('id', classData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('classes')
          .insert([submitData]);
        error = insertError;
      }

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      toast({
        title: "Thành công",
        description: classData ? "Đã cập nhật lớp học thành công" : "Đã thêm lớp học thành công",
        className: "bg-green-50 border-green-200 text-green-900",
      });

      onSaved();
      onClose();
    } catch (error) {
      console.error('Error saving class:', error);
      toast({
        title: "Lỗi",
        description: classData ? "Không thể cập nhật lớp học" : "Không thể thêm lớp học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{classData ? 'Sửa lớp học' : 'Thêm lớp học mới'}</DialogTitle>
          <DialogDescription>
            {classData ? 'Cập nhật thông tin lớp học' : 'Tạo lớp học mới trong hệ thống'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course_id">Khóa học *</Label>
              <Select
                value={formData.course_id}
                onValueChange={(value) => handleInputChange('course_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khóa học" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">Tên lớp học *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên lớp học"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Nhập mô tả lớp học"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="schedule">Lịch học</Label>
            <Input
              id="schedule"
              value={formData.schedule}
              onChange={(e) => handleInputChange('schedule', e.target.value)}
              placeholder="Ví dụ: Thứ 2, 4, 6 - 19:00-21:00"
            />
          </div>

          <div>
            <Label htmlFor="status">Trạng thái</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Đang hoạt động">Đang hoạt động</SelectItem>
                <SelectItem value="Đã kết thúc">Đã kết thúc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="instructor_id">Giảng viên *</Label>
            <Select
              value={formData.instructor_id}
              onValueChange={(value) => handleInputChange('instructor_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn giảng viên" />
              </SelectTrigger>
              <SelectContent>
                {instructors.map((instructor) => (
                  <SelectItem key={instructor.id} value={instructor.id}>
                    {instructor.fullname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : (classData ? 'Cập nhật' : 'Thêm lớp học')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassFormModal;
