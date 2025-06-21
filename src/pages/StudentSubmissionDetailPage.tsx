import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Calendar, User, CheckCircle, Clock, AlertCircle, Type, Image, Video, Edit, Save, X, Upload, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import StudentToolbar from '@/components/student/StudentToolbar';

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
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
  status: 'Chưa làm' | 'Đang chờ chấm' | 'Đã hoàn thành';
  submitted_at: string;
  feedback: string | null;
  assignment: {
    id: string;
    lesson: {
      id: string;
      title: string;
      lesson_number: number;
      class: {
        name: string;
      };
    };
  };
}

interface EditableBlock {
  id: string;
  type: 'text' | 'image' | 'video';
  content: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

const StudentSubmissionDetailPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editBlocks, setEditBlocks] = useState<EditableBlock[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingBlocks, setUploadingBlocks] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (submissionId) {
      fetchSubmissionDetail();
    }
  }, [submissionId]);

  const fetchSubmissionDetail = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('assignment_submissions')
        .select(`
          id,
          assignment_id,
          student_id,
          content,
          status,
          submitted_at,
          feedback,
          assignment:assignments (
            id,
            lesson:lessons (
              id,
              title,
              lesson_number,
              classes (
                name
              )
            )
          )
        `)
        .eq('id', submissionId)
        .single();

      if (error) throw error;

      setSubmission({
        id: data.id,
        assignment_id: data.assignment_id,
        student_id: data.student_id,
        content: data.content,
        status: data.status,
        submitted_at: data.submitted_at,
        feedback: data.feedback,
        assignment: {
          id: data.assignment.id,
          lesson: {
            id: data.assignment.lesson.id,
            title: data.assignment.lesson.title,
            lesson_number: data.assignment.lesson.lesson_number,
            class: data.assignment.lesson.classes || { name: 'Không xác định' }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching submission detail:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin bài nộp",
        variant: "destructive",
      });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'Chưa làm': { 
        text: 'Chưa làm', 
        class: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: AlertCircle 
      },
      'Đang chờ chấm': { 
        text: 'Đang chờ chấm', 
        class: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: Clock 
      },
      'Đã hoàn thành': { 
        text: 'Đã hoàn thành', 
        class: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle 
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || 
      { text: 'Không xác định', class: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle };

    const IconComponent = statusInfo.icon;

    return (
      <Badge className={`${statusInfo.class} border font-medium px-3 py-1 flex items-center space-x-2`}>
        <IconComponent className="w-4 h-4" />
        <span>{statusInfo.text}</span>
      </Badge>
    );
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const startEditing = () => {
    if (!submission?.content?.blocks) return;
    
    const blocksWithIds = submission.content.blocks.map(block => ({
      ...block,
      id: generateId()
    }));
    
    setEditBlocks(blocksWithIds);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditBlocks([]);
  };

  const updateBlockContent = (blockId: string, content: string) => {
    setEditBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, content } : block
    ));
  };

  const removeBlock = (blockId: string) => {
    setEditBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const addTextBlock = () => {
    const newBlock: EditableBlock = {
      id: generateId(),
      type: 'text',
      content: '',
    };
    setEditBlocks([...editBlocks, newBlock]);
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
    
    const newBlock: EditableBlock = {
      id: blockId,
      type,
      content: '',
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    };
    
    setEditBlocks(prev => [...prev, newBlock]);
    setUploadingBlocks(prev => new Set([...prev, blockId]));

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${submission?.assignment_id}/${currentUser.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('assignment-student-files')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('assignment-student-files')
        .getPublicUrl(filePath);

      setEditBlocks(prev => prev.map(block => 
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
      
      setEditBlocks(prev => prev.filter(block => block.id !== blockId));
    } finally {
      setUploadingBlocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(blockId);
        return newSet;
      });
    }
  };

  const saveChanges = async () => {
    if (editBlocks.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng thêm ít nhất một nội dung cho bài nộp",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const submissionContent = {
        blocks: editBlocks.map(({ id, ...block }) => block),
      };

      const { error } = await (supabase as any)
        .from('assignment_submissions')
        .update({
          content: submissionContent,
          status: 'Đang chờ chấm',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Bài tập đã được cập nhật thành công",
      });

      // Refresh submission data
      await fetchSubmissionDetail();
      setIsEditing(false);
      setEditBlocks([]);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu thay đổi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if user can edit (status is not "Đã hoàn thành")
  const canEdit = submission?.status === 'Chưa làm' || submission?.status === 'Đang chờ chấm';

  const renderContentBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div key={index} className="mb-4">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start space-x-3">
                <Type className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{block.content}</p>
              </div>
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={index} className="mb-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start space-x-3 mb-3">
                <Image className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-green-700">Hình ảnh</span>
              </div>
              <img 
                src={block.content} 
                alt="Submission image"
                className="max-w-full h-auto rounded-lg border border-green-200 shadow-sm"
              />
              {block.metadata?.fileName && (
                <p className="text-xs text-green-600 mt-2 bg-green-50 px-2 py-1 rounded">
                  {block.metadata.fileName}
                </p>
              )}
            </div>
          </div>
        );
      case 'video':
        return (
          <div key={index} className="mb-4">
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
              {block.metadata?.fileName && (
                <p className="text-xs text-purple-600 mt-2 bg-purple-50 px-2 py-1 rounded">
                  {block.metadata.fileName}
                </p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderSortedContentBlocks = (blocks: any[]) => {
    const sortedBlocks = [...blocks].sort((a, b) => {
      const typePriority = { 'text': 1, 'image': 2, 'video': 3 };
      return typePriority[a.type as keyof typeof typePriority] - typePriority[b.type as keyof typeof typePriority];
    });

    return sortedBlocks.map((block, index) => renderContentBlock(block, index));
  };

  const renderEditableBlock = (block: EditableBlock) => {
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
                    <div className="p-6 bg-gray-50 rounded-xl text-center border-2 border-dashed border-gray-300">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                      <span className="text-sm text-gray-500">Đang tải lên...</span>
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
                    <div className="p-6 bg-gray-50 rounded-xl text-center border-2 border-dashed border-gray-300">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                      <span className="text-sm text-gray-500">Đang tải lên...</span>
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02458b] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải bài nộp...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="text-center p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy bài nộp</h3>
            <Button onClick={() => navigate(-1)} className="w-full">
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Mobile Header */}
        <StudentToolbar
          title="Bài đã nộp"
          subtitle={`Buổi ${submission.assignment.lesson.lesson_number}: ${submission.assignment.lesson.title}`}
          rightContent={getStatusBadge(submission.status)}
        />

        {/* Mobile Content */}
        <div className="p-4">
          {/* Class Info Card */}
          <Card className="shadow-xl border-0 overflow-hidden mb-6">
            <CardHeader className="bg-[#02458b] text-white">
              <CardTitle className="text-xl font-bold">
                Bài tập đã nộp
              </CardTitle>
              <CardDescription className="text-white/80">
                {submission.assignment.lesson.class.name}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Submission Info */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-[#02458b]" />
                <span>Thông tin nộp bài</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Nộp lúc: {new Date(submission.submitted_at).toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Content */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#02458b]" />
                <span>Nội dung bài làm</span>
                </div>
                {canEdit && !isEditing && (
                  <Button
                    onClick={startEditing}
                    size="sm"
                    className="bg-[#02458b] hover:bg-[#02458b]/90 text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                )}
                {isEditing && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={saveChanges}
                      size="sm"
                      disabled={isSaving}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                    <Button
                      onClick={cancelEditing}
                      size="sm"
                      variant="outline"
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  {/* Add Content Buttons */}
                  <div className="mb-6">
                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addTextBlock}
                        className="flex items-center justify-center space-x-3 h-12 bg-[#02458b]/5 border-[#02458b]/20 text-[#02458b] hover:bg-[#02458b]/10"
                      >
                        <Type className="w-5 h-5" />
                        <span className="font-medium">Thêm văn bản</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addImageBlock}
                        className="flex items-center justify-center space-x-3 h-12 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        <Image className="w-5 h-5" />
                        <span className="font-medium">Thêm hình ảnh</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addVideoBlock}
                        className="flex items-center justify-center space-x-3 h-12 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                      >
                        <Video className="w-5 h-5" />
                        <span className="font-medium">Thêm video</span>
                      </Button>
                    </div>
                  </div>

                  {/* Edit Blocks */}
                  <div className="space-y-4">
                    {editBlocks.length === 0 ? (
                      <div className="text-center py-12 bg-[#02458b]/5 rounded-2xl border-2 border-dashed border-[#02458b]/20">
                        <Upload className="w-16 h-16 text-[#02458b] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có nội dung nào</h3>
                        <p className="text-gray-500 text-sm px-4">
                          Hãy thêm văn bản, hình ảnh hoặc video để hoàn thành bài tập
                        </p>
                      </div>
                    ) : (
                      editBlocks.map(block => renderEditableBlock(block))
                    )}
                  </div>
                </div>
              ) : (
                submission.content?.blocks && submission.content.blocks.length > 0 ? (
                renderSortedContentBlocks(submission.content.blocks)
              ) : (
                <p className="text-gray-500 text-center py-8">Không có nội dung</p>
                )
              )}
            </CardContent>
          </Card>

          {/* Feedback Section */}
          {submission.feedback && (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-3">
                  <User className="w-5 h-5 text-green-500" />
                  <span>Nhận xét từ giảng viên</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <p className="text-green-800">{submission.feedback}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <StudentToolbar
        title="Bài tập đã nộp"
        subtitle={`Buổi ${submission.assignment.lesson.lesson_number}: ${submission.assignment.lesson.title} - ${submission.assignment.lesson.class.name}`}
        rightContent={getStatusBadge(submission.status)}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Submission Info */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-[#02458b]/5 border-b">
              <CardTitle className="text-2xl flex items-center space-x-4">
                <Calendar className="w-7 h-7 text-[#02458b]" />
                <span>Thông tin nộp bài</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 text-lg">
                <Calendar className="w-6 h-6 text-gray-500" />
                <span>Nộp lúc: {new Date(submission.submitted_at).toLocaleString('vi-VN')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Submission Content */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-[#02458b]/5 border-b">
              <CardTitle className="text-2xl flex items-center justify-between">
                <div className="flex items-center space-x-4">
                <FileText className="w-7 h-7 text-[#02458b]" />
                <span>Nội dung bài làm</span>
                </div>
                {canEdit && !isEditing && (
                  <Button
                    onClick={startEditing}
                    className="bg-[#02458b] hover:bg-[#02458b]/90 text-white"
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    Chỉnh sửa
                  </Button>
                )}
                {isEditing && (
                  <div className="flex space-x-3">
                    <Button
                      onClick={saveChanges}
                      disabled={isSaving}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                    <Button
                      onClick={cancelEditing}
                      variant="outline"
                      disabled={isSaving}
                    >
                      <X className="w-5 h-5 mr-2" />
                      Hủy
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="bg-[#02458b]/5 rounded-2xl p-8 border border-[#02458b]/20">
                {isEditing ? (
                  <div>
                    {/* Add Content Buttons */}
                    <div className="mb-8">
                      <div className="grid grid-cols-3 gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addTextBlock}
                          className="flex items-center justify-center space-x-3 h-16 bg-[#02458b]/5 border-[#02458b]/20 text-[#02458b] hover:bg-[#02458b]/10"
                        >
                          <Type className="w-6 h-6" />
                          <span className="font-medium text-lg">Thêm văn bản</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addImageBlock}
                          className="flex items-center justify-center space-x-3 h-16 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        >
                          <Image className="w-6 h-6" />
                          <span className="font-medium text-lg">Thêm hình ảnh</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addVideoBlock}
                          className="flex items-center justify-center space-x-3 h-16 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                        >
                          <Video className="w-6 h-6" />
                          <span className="font-medium text-lg">Thêm video</span>
                        </Button>
                      </div>
                    </div>

                    {/* Edit Blocks */}
                    <div className="space-y-6">
                      {editBlocks.length === 0 ? (
                        <div className="text-center py-16 bg-[#02458b]/5 rounded-2xl border-2 border-dashed border-[#02458b]/20">
                          <Upload className="w-20 h-20 text-[#02458b] mx-auto mb-4" />
                          <h3 className="text-2xl font-semibold text-gray-700 mb-2">Chưa có nội dung nào</h3>
                          <p className="text-gray-500 text-lg px-8">
                            Hãy thêm văn bản, hình ảnh hoặc video để hoàn thành bài tập
                          </p>
                        </div>
                      ) : (
                        editBlocks.map(block => renderEditableBlock(block))
                      )}
                    </div>
                  </div>
                ) : (
                  submission.content?.blocks && submission.content.blocks.length > 0 ? (
                  renderSortedContentBlocks(submission.content.blocks)
                ) : (
                  <p className="text-gray-500 text-center py-16 text-xl">Không có nội dung</p>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feedback Section */}
          {submission.feedback && (
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="text-2xl flex items-center space-x-4">
                  <User className="w-7 h-7 text-green-500" />
                  <span>Nhận xét từ giảng viên</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                  <p className="text-green-800 text-lg leading-relaxed">{submission.feedback}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSubmissionDetailPage; 