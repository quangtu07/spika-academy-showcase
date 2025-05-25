
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileImage, FileVideo, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  title: string;
  description: string;
}

interface AssignmentUploadProps {
  assignment: Assignment;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignmentUpload = ({ assignment, onClose, onSuccess }: AssignmentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast({
          title: "Lỗi",
          description: "Chỉ được phép tải lên file hình ảnh hoặc video",
          variant: "destructive",
        });
        return;
      }

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "File không được vượt quá 50MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file để tải lên",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!currentUser) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${currentUser.id}/${assignment.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assignments')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assignments')
        .getPublicUrl(fileName);

      // Create submission record
      const fileType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
      
      const { error: submissionError } = await supabase
        .from('submissions')
        .insert({
          assignment_id: assignment.id,
          student_id: currentUser.id,
          file_url: publicUrl,
          file_type: fileType
        });

      if (submissionError) throw submissionError;

      onSuccess();
    } catch (error) {
      console.error('Error uploading assignment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lên bài tập. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nộp bài tập: {assignment.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Tải lên file bài tập (hình ảnh hoặc video)
            </Label>
            <div className="mt-2">
              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Chọn file để tải lên
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          Hỗ trợ hình ảnh và video (tối đa 50MB)
                        </span>
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedFile.type.startsWith('image/') ? (
                        <FileImage className="h-8 w-8 text-blue-600" />
                      ) : (
                        <FileVideo className="h-8 w-8 text-purple-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isUploading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpload}
              className="flex-1 bg-primary-600 hover:bg-primary-700"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Đang tải lên...' : 'Nộp bài'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentUpload;
