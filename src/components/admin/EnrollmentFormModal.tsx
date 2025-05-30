
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Class {
  id: string;
  name: string;
  course_id: string;
  courses: {
    name: string;
  };
}

interface Student {
  id: string;
  fullname: string;
}

interface EnrollmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const EnrollmentFormModal = ({ isOpen, onClose, onSaved }: EnrollmentFormModalProps) => {
  const [formData, setFormData] = useState({
    student_id: '',
    class_id: '',
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
      fetchClasses();
    }
  }, [isOpen]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, fullname')
        .eq('role', 'student');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách học viên",
        variant: "destructive",
      });
    }
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          course_id,
          courses!inner(name)
        `)
        .eq('status', 'Đang hoạt động');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách lớp học",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id || !formData.class_id) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn đầy đủ thông tin",
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
        .eq('class_id', formData.class_id)
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
          class_id: formData.class_id,
          status: 'active',
          enrolled_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã đăng ký lớp học thành công",
        className: "bg-green-50 border-green-200 text-green-900",
      });

      onSaved();
      onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Đăng ký lớp học
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="student">Học viên</Label>
            <Select
              value={formData.student_id}
              onValueChange={(value) => setFormData({ ...formData, student_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn học viên" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.fullname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Lớp học</Label>
            <Select
              value={formData.class_id}
              onValueChange={(value) => setFormData({ ...formData, class_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn lớp học" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name} - {classItem.courses.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentFormModal;
