import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Type, Image, Video, Upload, Trash2, FileText, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TeacherToolbar from '@/components/teacher/TeacherToolbar';
import NotificationBell from '@/components/teacher/NotificationBell';

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

interface Lesson {
  id: string;
  title: string;
  lesson_number: number;
  class: {
    name: string;
  };
}

const CreateAssignmentPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [blocks, setBlocks] = useState<AssignmentBlock[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingBlocks, setUploadingBlocks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (lessonId) {
      fetchLessonInfo();
    }
  }, [lessonId]);

  useEffect(() => {
    // Get teacherId from localStorage
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      setTeacherId(currentUser?.id || null);
    }
  }, []);

  const fetchLessonInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          lesson_number,
          classes (
            name
          )
        `)
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      setLesson({
        id: data.id,
        title: data.title,
        lesson_number: data.lesson_number,
        class: data.classes || { name: 'Không xác định' }
      });
    } catch (error) {
      console.error('Error fetching lesson info:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin buổi học",
        variant: "destructive",
      });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

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

      const { data: { publicUrl } } = supabase.storage
        .from('assignment-teacher-files')
        .getPublicUrl(filePath);

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
      const currentUserStr = localStorage.getItem('currentUser');
      
      if (!currentUserStr) {
        throw new Error('Bạn cần đăng nhập để thực hiện chức năng này');
      }

      const currentUser = JSON.parse(currentUserStr);
      
      if (!currentUser || !currentUser.id) {
        throw new Error('Thông tin người dùng không hợp lệ');
      }

      const assignmentContent = {
        blocks: blocks.map(({ id, ...block }) => block),
      };

      const assignmentData = {
        lesson_id: lessonId,
        instructor_id: currentUser.id,
        content: assignmentContent,
      };

      const { error } = await (supabase as any)
        .from('assignments')
        .insert(assignmentData);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Bài tập đã được giao thành công",
      });

      navigate(-1);
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

  const renderBlock = (block: AssignmentBlock) => {
    const isUploading = uploadingBlocks.has(block.id);

    return (
      <Card key={block.id} className="mb-4 border-0 shadow-lg">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              {block.type === 'text' && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Type className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-semibold text-gray-700">Văn bản</span>
                  </div>
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                    placeholder="Nhập nội dung văn bản..."
                    className="min-h-[120px] text-base resize-none"
                  />
                </div>
              )}
              
              {block.type === 'image' && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Image className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-semibold text-gray-700">Hình ảnh</span>
                  </div>
                  {isUploading ? (
                    <div className="flex items-center space-x-3 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                      <span className="text-sm text-green-700 font-medium">Đang tải lên {block.metadata?.fileName}...</span>
                    </div>
                  ) : block.content ? (
                    <div className="space-y-3">
                      <img 
                        src={block.content} 
                        alt={block.metadata?.fileName}
                        className="max-w-full h-auto rounded-xl border border-gray-200 shadow-sm"
                      />
                      <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full w-fit">
                        {block.metadata?.fileName}
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 rounded-xl text-center border-2 border-dashed border-gray-300">
                      <span className="text-sm text-gray-500">Đang xử lý hình ảnh...</span>
                    </div>
                  )}
                </div>
              )}
              
              {block.type === 'video' && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Video className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-semibold text-gray-700">Video</span>
                  </div>
                  {isUploading ? (
                    <div className="flex items-center space-x-3 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      <span className="text-sm text-purple-700 font-medium">Đang tải lên {block.metadata?.fileName}...</span>
                    </div>
                  ) : block.content ? (
                    <div className="space-y-3">
                      <video 
                        src={block.content} 
                        controls
                        className="max-w-full h-auto rounded-xl border border-gray-200 shadow-sm"
                      />
                      <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full w-fit">
                        {block.metadata?.fileName}
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 rounded-xl text-center border-2 border-dashed border-gray-300">
                      <span className="text-sm text-gray-500">Đang xử lý video...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeBlock(block.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
              disabled={isUploading}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải thông tin buổi học...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="text-center p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy buổi học</h3>
            <Button onClick={() => navigate(-1)} className="w-full">
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <TeacherToolbar 
        title="Giao bài tập"
        subtitle={lesson ? `Buổi ${lesson.lesson_number}: ${lesson.title} - ${lesson.class.name}` : undefined}
        rightContent={<NotificationBell teacherId={teacherId} />}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          {/* Lesson Info Card */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl lg:text-2xl">
                    Buổi {lesson.lesson_number}: {lesson.title}
                  </CardTitle>
                  <CardDescription className="text-indigo-100 text-sm lg:text-base">
                    {lesson.class.name}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content Creation */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b">
              <CardTitle className="text-lg lg:text-xl flex items-center space-x-3">
                <FileText className="w-6 h-6 text-indigo-500" />
                <span>Nội dung bài tập</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 lg:p-8">
              {/* Add Content Buttons */}
              <div className="mb-6 lg:mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTextBlock}
                    className="flex items-center justify-center space-x-3 h-12 lg:h-14 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100"
                  >
                    <Type className="w-5 h-5" />
                    <span className="font-medium">Thêm văn bản</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addImageBlock}
                    className="flex items-center justify-center space-x-3 h-12 lg:h-14 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100"
                  >
                    <Image className="w-5 h-5" />
                    <span className="font-medium">Thêm hình ảnh</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addVideoBlock}
                    className="flex items-center justify-center space-x-3 h-12 lg:h-14 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100"
                  >
                    <Video className="w-5 h-5" />
                    <span className="font-medium">Thêm video</span>
                  </Button>
                </div>
              </div>

              {/* Content Blocks */}
              <div>
                {blocks.length === 0 ? (
                  <div className="text-center py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <Upload className="w-16 h-16 lg:w-20 lg:h-20 text-gray-400 mx-auto mb-4 lg:mb-6" />
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">Chưa có nội dung nào</h3>
                    <p className="text-gray-500 text-sm lg:text-base px-4">
                      Hãy thêm văn bản, hình ảnh hoặc video để tạo bài tập cho học viên
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 lg:space-y-6">
                    {blocks.map(renderBlock)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 lg:h-14 text-base"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || uploadingBlocks.size > 0 || blocks.length === 0}
              className="w-full sm:w-auto h-12 lg:h-14 text-base bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Đang giao bài tập...</span>
                </div>
              ) : (
                'Giao bài tập'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentPage; 