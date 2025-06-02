
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Upload, Link2, X, FileImage, FileVideo, File } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Lesson {
  id: string;
  title: string;
  lesson_number: number;
}

interface AssignmentCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  onSaved: () => void;
}

interface AttachmentFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size: number;
}

interface AttachmentLink {
  title: string;
  url: string;
  description: string;
}

const AssignmentCreator = ({ isOpen, onClose, lesson, onSaved }: AssignmentCreatorProps) => {
  const [content, setContent] = useState('');
  const [instructions, setInstructions] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [submissionFormat, setSubmissionFormat] = useState<string[]>(['image', 'video', 'document', 'text']);
  const [attachedFiles, setAttachedFiles] = useState<AttachmentFile[]>([]);
  const [attachedLinks, setAttachedLinks] = useState<AttachmentLink[]>([]);
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('assignment-files')
          .upload(fileName, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('assignment-files')
          .getPublicUrl(fileName);

        let fileType: 'image' | 'video' | 'document' = 'document';
        if (file.type.startsWith('image/')) fileType = 'image';
        else if (file.type.startsWith('video/')) fileType = 'video';

        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: fileType,
          url: urlData.publicUrl,
          size: file.size
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setAttachedFiles(prev => [...prev, ...uploadedFiles]);
      
      toast({
        title: "Thành công",
        description: `Đã tải lên ${uploadedFiles.length} file`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lên file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề và URL",
        variant: "destructive",
      });
      return;
    }

    setAttachedLinks(prev => [...prev, { ...newLink }]);
    setNewLink({ title: '', url: '', description: '' });
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleRemoveLink = (index: number) => {
    setAttachedLinks(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSubmissionFormat = (format: string) => {
    setSubmissionFormat(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung bài tập",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const attachments = {
        files: attachedFiles,
        links: attachedLinks
      };

      const { error } = await supabase
        .from('assignments')
        .insert({
          lesson_id: lesson.id,
          content: content.trim(),
          instructions: instructions.trim() || null,
          attachments,
          max_score: maxScore,
          allow_late_submission: allowLateSubmission,
          submission_format: submissionFormat
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã tạo bài tập thành công",
      });

      onSaved();
      onClose();
      
      // Reset form
      setContent('');
      setInstructions('');
      setMaxScore(100);
      setAllowLateSubmission(false);
      setSubmissionFormat(['image', 'video', 'document', 'text']);
      setAttachedFiles([]);
      setAttachedLinks([]);
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo bài tập",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="h-4 w-4 text-blue-600" />;
      case 'video': return <FileVideo className="h-4 w-4 text-purple-600" />;
      default: return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Giao bài tập - Bài {lesson.lesson_number}: {lesson.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nội dung bài tập */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-base font-medium">
              Nội dung bài tập *
            </Label>
            <Textarea
              id="content"
              placeholder="Nhập nội dung bài tập..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Hướng dẫn chi tiết */}
          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-base font-medium">
              Hướng dẫn chi tiết
            </Label>
            <Textarea
              id="instructions"
              placeholder="Nhập hướng dẫn chi tiết (không bắt buộc)..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* File đính kèm */}
          <div className="space-y-3">
            <Label className="text-base font-medium">File đính kèm</Label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                <span>{isUploading ? 'Đang tải lên...' : 'Chọn file'}</span>
              </label>
            </div>

            {attachedFiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {attachedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Liên kết tham khảo */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Liên kết tham khảo</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Tiêu đề liên kết"
                value={newLink.title}
                onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
              />
              <Input
                placeholder="URL (https://...)"
                value={newLink.url}
                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
              />
              <Input
                placeholder="Mô tả (không bắt buộc)"
                value={newLink.description}
                onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                className="md:col-span-2"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddLink}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm liên kết
            </Button>

            {attachedLinks.length > 0 && (
              <div className="space-y-2">
                {attachedLinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Link2 className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">{link.title}</p>
                        <p className="text-xs text-blue-600 truncate max-w-[300px]">{link.url}</p>
                        {link.description && (
                          <p className="text-xs text-gray-500">{link.description}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLink(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cài đặt bài tập */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maxScore" className="text-base font-medium">
                Điểm tối đa
              </Label>
              <Input
                id="maxScore"
                type="number"
                min="1"
                max="1000"
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value) || 100)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Cho phép nộp muộn</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={allowLateSubmission}
                  onCheckedChange={setAllowLateSubmission}
                />
                <span className="text-sm text-gray-600">
                  {allowLateSubmission ? 'Cho phép' : 'Không cho phép'}
                </span>
              </div>
            </div>
          </div>

          {/* Định dạng nộp bài */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Định dạng nộp bài cho phép</Label>
            <div className="flex flex-wrap gap-2">
              {['image', 'video', 'document', 'text'].map((format) => (
                <Badge
                  key={format}
                  variant={submissionFormat.includes(format) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSubmissionFormat(format)}
                >
                  {format === 'image' && 'Hình ảnh'}
                  {format === 'video' && 'Video'}
                  {format === 'document' && 'Tài liệu'}
                  {format === 'text' && 'Văn bản'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || !content.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isSaving ? 'Đang lưu...' : 'Tạo bài tập'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentCreator;
