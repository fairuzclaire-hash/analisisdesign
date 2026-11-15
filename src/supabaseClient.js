import { createClient } from '@supabase/supabase-js';

// Gunakan environment variables untuk keamanan (untuk production)
// Fallback ke hardcoded untuk development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zxysltvspdgsnkupqiep.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_i3MjPzwpgHyn2SZG8OG4Zg_D-H35N0d';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fungsi helper untuk upload file
export const uploadFile = async (file, folder = 'tugas') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('tugas-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Dapatkan public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tugas-files')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
      path: filePath,
      name: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fungsi untuk hapus file
export const deleteFile = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from('tugas-files')
      .remove([filePath]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
};
