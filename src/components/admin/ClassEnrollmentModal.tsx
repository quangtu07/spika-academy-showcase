
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  fullname: string;
  email: string;
}

interface ClassEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData?: any;
  onSaved: () => void;
}

const ClassEnrollmentModal: React.FC<ClassEnrollmentModalProps> = ({ isOpen, onClose, classData, onSaved }) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && classData) {
      fetchAvailableStudents();
    }
  }, [isOpen, classData]);

  const fetchAvailableStudents = async () => {
    try {
      // Lấy danh sách học viên đã đăng ký lớp này
      const { data: enrolledStudents, error: enrolledError } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('class_id', classData.id);

      if (enrolledError) throw enrolledError;

      const enrolledStudentIds = enrolledStudents?.map(e => e.student_id) || [];

      // Tạo query để loại trừ học viên đã đăng ký
      let query = supabase
        .from('profiles')
        .select('id, fullname, email')
        .eq('role', 'student');

      if (enrolledStudentIds.length > 0) {
        query = query.not('id', 'in', `(${enrolledStudentIds.join(',')})`);
      }

      const { data: allStudents, error: studentsError } = await query;

      if (studentsError) throw studentsError;

      setAvailableStudents(allStudents || []);
    } catch (error) {
      console.error('Error fetching available students:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách học viên",
        variant: "destructive",
      });
    }
  };

  const handleEnrollStudent = async () => {
    if (!selectedStudentId || !classData) return;

    setLoading(true);
    try {
      console.log('Enrolling student:', {
        student_id: selectedStudentId,
        class_id: classData.id
      });

      const { error } = await supabase
        .from('enrollments')
        .insert([{
          student_id: selectedStudentId,
          class_id: classData.id,
          status: 'active'
        }]);

      if (error) {
        console.error('Enrollment error:', error);
        throw error;
      }

      toast({
        title: "Thành công",
        description: "Đã thêm học viên vào lớp thành công",
        className: "bg-green-50 border-green-200 text-green-900",
      });

      onSaved();
      onClose();
      setSelectedStudentId('');
    } catch (error) {
      console.error('Error enrolling student:', error);
      toast({
        title: "Lỗi", 
        description: "Không thể thêm học viên vào lớp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedStudentId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm học viên vào lớp</DialogTitle>
          <DialogDescription>
            Thêm học viên vào lớp: {classData?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="student">Chọn học viên</Label>
            <Select
              value={selectedStudentId}
              onValueChange={setSelectedStudentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn học viên" />
              </SelectTrigger>
              <SelectContent>
                {availableStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.fullname} - {student.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {availableStudents.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Không có học viên nào có thể thêm vào lớp này
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleEnrollStudent}
              disabled={loading || !selectedStudentId}
            >
              {loading ? 'Đang xử lý...' : 'Thêm học viên'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassEnrollmentModal;
