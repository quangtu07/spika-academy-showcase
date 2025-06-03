import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Type, Image, Video, Upload, Trash2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AssignmentBlock {
  id: string;
  type: 'text' | 'image' | 'video';
  content: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: {
    id: string;
    title: string;
    lesson_number: number;
  };
  onSaved: () => void;
}

const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  isOpen,
  onClose,
  lesson,
  onSaved,
}) => {
  const [blocks, setBlocks] = useState<AssignmentBlock[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingBlocks, setUploadingBlocks] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addTextBlock = () => {
    const newBlock: AssignmentBlock = {
      id: generateId(),
      type: 'text',
      content: '',
    };
    setBlocks([...blocks, newBlock]);
  };

  const addImageBlock = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadFile(file, 'image');
      }
    };
    input.click();
  };

  const addVideoBlock = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadFile(file, 'video');
      }
    };
    input.click();
  };

  const uploadFile = async (file: File, type: 'image' | 'video') => {
    const blockId = generateId();
    
    // Tạo block placeholder
    const newBlock: AssignmentBlock = {
      id: blockId,
      type,
      content: '',
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    };
    
    setBlocks(prev => [...prev, newBlock]);
    setUploadingBlocks(prev => new Set([...prev, blockId]));

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('assignment-teacher-files')
        .upload(filePath, file);

      if (error) throw error;

      // Lấy public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assignment-teacher-files')
        .getPublicUrl(filePath);

      // Cập nhật block với URL
      setBlocks(prev => prev.map(block => 
        block.id === blockId 
          ? { ...block, content: publicUrl }
          : block
      ));

      toast({
        title: "Thành công",
        description: `${type === 'image' ? 'Hình ảnh' : 'Video'} đã được tải lên thành công`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lên file. Vui lòng thử lại.",
        variant: "destructive",
      });
      
      // Xóa block nếu upload failed
      setBlocks(prev => prev.filter(block => block.id !== blockId));
    } finally {
      setUploadingBlocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(blockId);
        return newSet;
      });
    }
  };

  const updateBlockContent = (blockId: string, content: string) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, content } : block
    ));
  };

  const removeBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (blocks.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng thêm ít nhất một nội dung cho bài tập",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Lấy user hiện tại từ localStorage (custom authentication của project)
      const currentUserStr = localStorage.getItem('currentUser');
      
      if (!currentUserStr) {
        throw new Error('Bạn cần đăng nhập để thực hiện chức năng này');
      }

      const currentUser = JSON.parse(currentUserStr);
      
      if (!currentUser || !currentUser.id) {
        throw new Error('Thông tin người dùng không hợp lệ');
      }

      console.log('Current User:', currentUser); // Debug

      const assignmentContent = {
        blocks: blocks.map(({ id, ...block }) => block), // Bỏ id khi lưu
      };

      const assignmentData = {
        lesson_id: lesson.id,
        instructor_id: currentUser.id, // Sử dụng user ID từ localStorage
        content: assignmentContent,
      };

      console.log('Assignment Data:', assignmentData); // Debug

      const { error } = await (supabase as any)
        .from('assignments')
        .insert(assignmentData);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Bài tập đã được giao thành công",
      });

      onSaved();
      handleClose();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tạo bài tập. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBlocks([]);
    setUploadingBlocks(new Set());
    onClose();
  };

  const renderBlock = (block: AssignmentBlock) => {
    const isUploading = uploadingBlocks.has(block.id);

    return (
      <Card key={block.id} className="mb-3 sm:mb-4">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="flex-1">
              {block.type === 'text' && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Type className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Văn bản</span>
                  </div>
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                    placeholder="Nhập nội dung văn bản..."
                    className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                  />
                </div>
              )}
              
              {block.type === 'image' && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Image className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">Hình ảnh</span>
                  </div>
                  {isUploading ? (
                    <div className="flex items-center space-x-2 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-green-600"></div>
                      <span className="text-xs sm:text-sm text-gray-600 truncate">Đang tải lên {block.metadata?.fileName}...</span>
                    </div>
                  ) : block.content ? (
                    <div className="space-y-2">
                      <img 
                        src={block.content} 
                        alt={block.metadata?.fileName}
                        className="max-w-full h-auto rounded-lg border border-gray-200"
                      />
                      <p className="text-xs text-gray-500 truncate">{block.metadata?.fileName}</p>
                    </div>
                  ) : (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg text-center">
                      <span className="text-xs sm:text-sm text-gray-500">Đang xử lý hình ảnh...</span>
                    </div>
                  )}
                </div>
              )}
              
              {block.type === 'video' && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Video className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">Video</span>
                  </div>
                  {isUploading ? (
                    <div className="flex items-center space-x-2 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-purple-600"></div>
                      <span className="text-xs sm:text-sm text-gray-600 truncate">Đang tải lên {block.metadata?.fileName}...</span>
                    </div>
                  ) : block.content ? (
                    <div className="space-y-2">
                      <video 
                        src={block.content} 
                        controls
                        className="max-w-full h-auto rounded-lg border border-gray-200"
                      />
                      <p className="text-xs text-gray-500 truncate">{block.metadata?.fileName}</p>
                    </div>
                  ) : (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg text-center">
                      <span className="text-xs sm:text-sm text-gray-500">Đang xử lý video...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeBlock(block.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 sm:p-2"
              disabled={isUploading}
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[600px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Giao bài tập cho Buổi {lesson.lesson_number}: {lesson.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Add Content Buttons */}
          <div className="border-t pt-3 sm:pt-4">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Nội dung bài tập</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 sm:mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={addTextBlock}
                className="flex items-center justify-center space-x-2 h-10 sm:h-auto"
                size="sm"
              >
                <Type className="w-4 h-4" />
                <span className="text-sm">Thêm văn bản</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={addImageBlock}
                className="flex items-center justify-center space-x-2 h-10 sm:h-auto"
                size="sm"
              >
                <Image className="w-4 h-4" />
                <span className="text-sm">Thêm hình ảnh</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={addVideoBlock}
                className="flex items-center justify-center space-x-2 h-10 sm:h-auto"
                size="sm"
              >
                <Video className="w-4 h-4" />
                <span className="text-sm">Thêm video</span>
              </Button>
            </div>

            {/* Content Blocks */}
            <div>
              {blocks.length === 0 ? (
                <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                  <p className="text-sm sm:text-base text-gray-500 px-4">Chưa có nội dung nào. Hãy thêm văn bản, hình ảnh hoặc video.</p>
                </div>
              ) : (
                blocks.map(renderBlock)
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 border-t pt-3 sm:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || uploadingBlocks.size > 0}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isSubmitting ? 'Đang giao bài tập...' : 'Giao bài tập'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentFormModal; 