import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LessonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: any;
  onSaved: () => void;
}

const LessonFormModal: React.FC<LessonFormModalProps> = ({ isOpen, onClose, classData, onSaved }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [nextLessonNumber, setNextLessonNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && classData) {
      fetchNextLessonNumber();
    }
  }, [isOpen, classData]);

  const fetchNextLessonNumber = async () => {
    try {
      const { data: maxLessonData, error: maxLessonError } = await supabase
        .from('lessons')
        .select('lesson_number')
        .eq('class_id', classData.id)
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
          class_id: classData.id,
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

      onSaved();
      onClose();
      setFormData({ title: '', content: '' });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm buổi học mới (Buổi {nextLessonNumber})</DialogTitle>
          <DialogDescription>
            Thêm buổi học mới cho lớp: {classData?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề buổi học</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Nhập tiêu đề buổi học"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Nội dung</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Nhập nội dung buổi học"
              required
              rows={5}
            />
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
              {loading ? "Đang xử lý..." : "Thêm buổi học"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LessonFormModal; 