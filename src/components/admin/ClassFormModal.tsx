
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
    max_students: '',
    start_date: '',
    end_date: '',
    schedule: '',
    room: '',
    status: 'active'
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
      if (classData) {
        setFormData({
          course_id: classData.course_id || '',
          name: classData.name || '',
          description: classData.description || '',
          max_students: classData.max_students?.toString() || '',
          start_date: classData.start_date ? classData.start_date.split('T')[0] : '',
          end_date: classData.end_date ? classData.end_date.split('T')[0] : '',
          schedule: classData.schedule || '',
          room: classData.room || '',
          status: classData.status || 'active'
        });
      } else {
        setFormData({
          course_id: '',
          name: '',
          description: '',
          max_students: '',
          start_date: '',
          end_date: '',
          schedule: '',
          room: '',
          status: 'active'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        course_id: formData.course_id,
        name: formData.name,
        description: formData.description || null,
        max_students: formData.max_students ? parseInt(formData.max_students) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        schedule: formData.schedule || null,
        room: formData.room || null,
        status: formData.status
      };

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

      if (error) throw error;

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_students">Số học viên tối đa</Label>
              <Input
                id="max_students"
                type="number"
                value={formData.max_students}
                onChange={(e) => handleInputChange('max_students', e.target.value)}
                placeholder="Nhập số học viên tối đa"
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="room">Phòng học</Label>
              <Input
                id="room"
                value={formData.room}
                onChange={(e) => handleInputChange('room', e.target.value)}
                placeholder="Nhập phòng học"
              />
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Ngày bắt đầu</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="end_date">Ngày kết thúc</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
              />
            </div>
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
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
                <SelectItem value="completed">Đã hoàn thành</SelectItem>
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
