import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Type, Image, Video, Upload, Trash2, Send, FileText, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import StudentToolbar from '@/components/student/StudentToolbar';

interface SubmissionBlock {
  id: string;
  type: 'text' | 'image' | 'video';
  content: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

interface Assignment {
  id: string;
  content: {
    blocks: Array<{
      type: 'text' | 'image' | 'video';
      content: string;
      metadata?: {
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
      };
    }>;
  };
  created_at: string;
  instructor: {
    fullname: string;
  };
}

const StudentSubmissionPage = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissionBlocks, setSubmissionBlocks] = useState<SubmissionBlock[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingBlocks, setUploadingBlocks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('assignments')
        .select(`
          id,
          content,
          created_at,
          instructor:profiles (
            fullname
          )
        `)
        .eq('id', assignmentId)
        .single();

      if (error) throw error;

      setAssignment({
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        instructor: data.instructor || { fullname: 'Không xác định' }
      });
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin bài tập",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addTextBlock = () => {
    const newBlock: SubmissionBlock = {
      id: generateId(),
      type: 'text',
      content: '',
    };
    setSubmissionBlocks([...submissionBlocks, newBlock]);
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
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để tải lên file",
        variant: "destructive",
      });
      return;
    }

    const currentUser = JSON.parse(currentUserStr);
    const blockId = generateId();
    
    const newBlock: SubmissionBlock = {
      id: blockId,
      type,
      content: '',
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    };
    
    setSubmissionBlocks(prev => [...prev, newBlock]);
    setUploadingBlocks(prev => new Set([...prev, blockId]));

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${assignmentId}/${currentUser.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('assignment-student-files')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('assignment-student-files')
        .getPublicUrl(filePath);

      setSubmissionBlocks(prev => prev.map(block => 
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
      
      setSubmissionBlocks(prev => prev.filter(block => block.id !== blockId));
    } finally {
      setUploadingBlocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(blockId);
        return newSet;
      });
    }
  };

  const updateBlockContent = (blockId: string, content: string) => {
    setSubmissionBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, content } : block
    ));
  };

  const removeBlock = (blockId: string) => {
    setSubmissionBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const handleSubmitAssignment = async () => {
    if (submissionBlocks.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng thêm ít nhất một nội dung cho bài nộp",
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

      const submissionContent = {
        blocks: submissionBlocks.map(({ id, ...block }) => block),
      };

      // Kiểm tra xem đã có submission record chưa
      const { data: existingSubmission, error: checkError } = await (supabase as any)
        .from('assignment_submissions')
        .select('id')
        .eq('assignment_id', assignmentId)
        .eq('student_id', currentUser.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let result;
      if (existingSubmission) {
        // Update existing submission
        result = await (supabase as any)
          .from('assignment_submissions')
          .update({
            content: submissionContent,
            status: 'Đang chờ chấm',
            submitted_at: new Date().toISOString(),
          })
          .eq('assignment_id', assignmentId)
          .eq('student_id', currentUser.id);
      } else {
        // Create new submission
        result = await (supabase as any)
          .from('assignment_submissions')
          .insert({
            assignment_id: assignmentId,
            student_id: currentUser.id,
            content: submissionContent,
            status: 'Đang chờ chấm',
            submitted_at: new Date().toISOString(),
          });
      }

      if (result.error) throw result.error;

      toast({
        title: "Thành công",
        description: "Bài tập đã được nộp thành công",
      });

      navigate(-1);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể nộp bài tập. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <StudentToolbar
        title="Nộp bài tập"
        subtitle="Thêm nội dung bài làm của bạn"
      />

      {/* Content */}
      <div className={`${isMobile ? 'p-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        <div className="space-y-8">
          {/* Assignment Info */}
          {assignment && (
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <CardTitle className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold flex items-center space-x-3`}>
                  <FileText className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                  <span>Bài tập</span>
                </CardTitle>
                <CardDescription className="text-indigo-100 space-y-1">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-3 h-3" />
                    <span>Giảng viên: {assignment.instructor.fullname}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-3 h-3" />
                    <span>Giao ngày: {new Date(assignment.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Nội dung bài tập</h4>
                <div className="space-y-4">
                  {assignment.content.blocks.map((block, index) => (
                    <div key={index} className="mb-4">
                      {block.type === 'text' && (
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start space-x-3">
                            <Type className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{block.content}</p>
                          </div>
                        </div>
                      )}
                      {block.type === 'image' && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-start space-x-3 mb-3">
                            <Image className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-green-700">Hình ảnh</span>
                          </div>
                          <img 
                            src={block.content} 
                            alt="Assignment image"
                            className="max-w-full h-auto rounded-lg border border-green-200 shadow-sm"
                          />
                        </div>
                      )}
                      {block.type === 'video' && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-start space-x-3 mb-3">
                            <Video className="w-5 h-5 text-purple-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-purple-700">Video</span>
                          </div>
                          <video 
                            src={block.content} 
                            controls
                            className="max-w-full h-auto rounded-lg border border-purple-200 shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Form */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-900`}>
                Bài làm của bạn
              </CardTitle>
              <CardDescription className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-600`}>
                Thêm nội dung bài làm bằng cách chọn loại nội dung bên dưới
              </CardDescription>
            </CardHeader>
            
            <CardContent className={`${isMobile ? 'p-4' : 'p-8'}`}>
              {/* Add Content Buttons */}
              <div className="mb-6">
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-3`}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTextBlock}
                    className={`flex items-center justify-center space-x-3 ${isMobile ? 'h-12' : 'h-16'} bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100`}
                  >
                    <Type className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                    <span className={`font-medium ${isMobile ? '' : 'text-lg'}`}>Thêm văn bản</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addImageBlock}
                    className={`flex items-center justify-center space-x-3 ${isMobile ? 'h-12' : 'h-16'} bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100`}
                  >
                    <Image className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                    <span className={`font-medium ${isMobile ? '' : 'text-lg'}`}>Thêm hình ảnh</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addVideoBlock}
                    className={`flex items-center justify-center space-x-3 ${isMobile ? 'h-12' : 'h-16'} bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100`}
                  >
                    <Video className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                    <span className={`font-medium ${isMobile ? '' : 'text-lg'}`}>Thêm video</span>
                  </Button>
                </div>
              </div>

              {/* Content Blocks */}
              <div className="mb-8">
                {submissionBlocks.length === 0 ? (
                  <div className={`text-center ${isMobile ? 'py-12' : 'py-16'} bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-dashed border-gray-300`}>
                    <Upload className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} text-gray-400 mx-auto mb-4`} />
                    <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold text-gray-700 mb-2`}>Chưa có nội dung nào</h3>
                    <p className={`text-gray-500 ${isMobile ? 'text-sm px-4' : 'text-lg px-8'}`}>
                      Hãy thêm văn bản, hình ảnh hoặc video để hoàn thành bài tập
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissionBlocks.map((block) => {
                      const isUploading = uploadingBlocks.has(block.id);
                      return (
                        <Card key={block.id} className="mb-4 border-0 shadow-lg">
                          <CardContent className="p-4">
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
                    })}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className={`${isMobile ? 'fixed bottom-4 left-4 right-4 z-40' : 'flex justify-end'}`}>
                <Button
                  onClick={handleSubmitAssignment}
                  disabled={isSubmitting || uploadingBlocks.size > 0 || submissionBlocks.length === 0}
                  size="lg"
                  className={`${isMobile ? 'w-full h-12' : 'px-8 py-3 text-lg'} bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang nộp bài...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="w-5 h-5" />
                      <span>Nộp bài tập</span>
                    </div>
                  )}
                </Button>
              </div>

              {/* Bottom Padding for Mobile Fixed Button */}
              {isMobile && <div className="h-20"></div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentSubmissionPage; 