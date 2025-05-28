import { supabase } from '@/integrations/supabase/client';

const COURSE_IMAGES_BUCKET = 'course-images';

export const uploadCourseImage = async (file: File, courseId: string): Promise<string> => {
  try {
    // Tạo tên file theo format: {courseId}-{timestamp}.{extension}
    const fileExt = file.name.split('.').pop();
    const fileName = `${courseId}-${Date.now()}.${fileExt}`;

    // Upload file mới
    const { error: uploadError } = await supabase.storage
      .from(COURSE_IMAGES_BUCKET)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Lấy public URL của file
    const { data: { publicUrl } } = supabase.storage
      .from(COURSE_IMAGES_BUCKET)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteCourseImage = async (imageUrl: string): Promise<void> => {
  try {
    // Lấy tên file từ URL
    const fileName = imageUrl.split('/').pop();
    if (!fileName) return;

    // Xóa file cũ
    const { error } = await supabase.storage
      .from(COURSE_IMAGES_BUCKET)
      .remove([fileName]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}; 