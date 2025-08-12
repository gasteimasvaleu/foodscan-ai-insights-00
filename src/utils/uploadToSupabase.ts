import { supabase } from "@/integrations/supabase/client";

export interface UploadProgress {
  progress: number;
  isUploading: boolean;
}

export interface UploadResult {
  url: string;
  path: string;
}

export const uploadToSupabase = async (
  file: File,
  folder: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  if (onProgress) {
    onProgress({ progress: 0, isUploading: true });
  }

  try {
    const { data, error } = await supabase.storage
      .from('nutritionist-ads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    if (onProgress) {
      onProgress({ progress: 100, isUploading: false });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('nutritionist-ads')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath
    };
  } catch (error) {
    if (onProgress) {
      onProgress({ progress: 0, isUploading: false });
    }
    throw error;
  }
};

export const deleteFromSupabase = async (path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('nutritionist-ads')
    .remove([path]);

  if (error) throw error;
};