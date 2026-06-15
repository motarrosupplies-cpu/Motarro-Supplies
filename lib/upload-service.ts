import { supabase, supabaseAdmin } from './supabaseClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface UploadProgress {
  progress: number
  uploaded: boolean
  error?: string
}

export interface UploadResult {
  url: string
  filename: string
  size: number
}

export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void,
  folder: string = 'products'
): Promise<UploadResult> {
  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error(`File size exceeds 10MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Allowed types: JPEG, PNG, GIF, WebP`);
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  // Normalize folder name (remove leading/trailing slashes)
  const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
  const filePath = `${normalizedFolder}/${fileName}`;
  
  console.log('[UploadService] Folder configuration:', {
    requestedFolder: folder,
    normalizedFolder: normalizedFolder,
    filePath: filePath
  });

  // Check if Supabase is properly configured
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }

  // Check if user is authenticated (for regular client)
  let client = supabase;
  let usingAdminClient = false;
  
  console.log('[UploadService] Checking Supabase client availability...', {
    hasSupabaseAdmin: !!supabaseAdmin,
    supabaseAdminType: typeof supabaseAdmin
  });
  
  if (supabaseAdmin) {
    try {
      // Try to access a property to verify the admin client is actually initialized
      const testAccess = supabaseAdmin.storage;
      if (testAccess) {
        // Use admin client if available (bypasses RLS)
        client = supabaseAdmin;
        usingAdminClient = true;
        console.log('[UploadService] Using admin client (bypasses RLS)');
      } else {
        console.warn('[UploadService] supabaseAdmin exists but storage is not available, falling back to regular client');
      }
    } catch (e) {
      console.warn('[UploadService] Error accessing supabaseAdmin, falling back to regular client:', e);
    }
  }
  
  if (!usingAdminClient) {
    // Check authentication for regular client
    console.log('[UploadService] Using regular client, checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[UploadService] Authentication error:', authError);
      throw new Error('You must be logged in to upload images. Please refresh the page and try again.');
    }
    console.log('[UploadService] User authenticated:', user.email);
  }

  // Verify client is properly initialized (not a placeholder)
  if (!client || !client.storage) {
    throw new Error('Supabase client is not properly initialized. Please refresh the page and try again.');
  }
  
  console.log('[UploadService] Uploading file:', {
    fileName,
    filePath,
    fileSize: file.size,
    fileType: file.type,
    usingAdminClient: usingAdminClient,
    clientType: usingAdminClient ? 'admin' : 'regular'
  });

  // Supabase upload with extended cache control
  console.log('[UploadService] Calling Supabase storage.upload...');
  const { data, error } = await client.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '2592000', // 30 days cache
      upsert: false,
    });
  
  console.log('[UploadService] Upload response:', { data, error: error ? error.message : null });

  if (error) {
    console.error('Supabase upload error:', error);
    
    // Provide more helpful error messages
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      // Try with a new unique filename
      const retryFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 12)}.${fileExt}`;
      const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
      const retryPath = `${normalizedFolder}/${retryFileName}`;
      const { data: retryData, error: retryError } = await client.storage
        .from('product-images')
        .upload(retryPath, file, {
          cacheControl: '2592000',
          upsert: false,
        });
      
      if (retryError) {
        throw new Error(`Upload failed: ${retryError.message}`);
      }
      
      const { data: retryUrlData } = client.storage
        .from('product-images')
        .getPublicUrl(retryPath);
      
      return {
        url: retryUrlData.publicUrl,
        filename: retryFileName,
        size: file.size,
      };
    } else if (error.message.includes('permission') || error.message.includes('policy') || error.message.includes('Forbidden')) {
      throw new Error('Permission denied. Please ensure you are logged in as an admin and have upload permissions. If the issue persists, check your Supabase storage bucket policies.');
    } else if (error.message.includes('size') || error.message.includes('too large')) {
      throw new Error('File size is too large. Maximum size is 10MB.');
    } else if (error.message.includes('JWT') || error.message.includes('token')) {
      throw new Error('Authentication expired. Please refresh the page and try again.');
    } else {
      throw new Error(`Upload failed: ${error.message}. Please try again or contact support if the issue persists.`);
    }
  }

  if (!data) {
    throw new Error('Upload failed: No data returned from server');
  }

  // Get public URL
  const { data: publicUrlData } = client.storage
    .from('product-images')
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded file');
  }

  console.log('Upload successful:', {
    path: filePath,
    url: publicUrlData.publicUrl
  });

  return {
    url: publicUrlData.publicUrl,
    filename: fileName,
    size: file.size,
  };
}

export async function uploadMultipleFiles(
  files: File[],
  onProgress?: (progress: number) => void,
  folder: string = 'products'
): Promise<UploadResult[]> {
  const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');

  // Server-side uploads (service role) — no browser auth required
  const serverUploadRoutes: Record<string, string> = {
    blog: '/api/upload/blog',
    'custom-printing': '/api/upload/custom-printing',
  };
  const uploadRoute = serverUploadRoutes[normalizedFolder];
  if (uploadRoute && files.length > 0) {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const res = await fetch(uploadRoute, { method: 'POST', body: formData });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Upload failed');
    }
    const data = await res.json();
    onProgress?.(100);
    const results = data.results as Array<{ url: string; filename?: string; size?: number }> | undefined;
    const urls = data.urls as string[] | undefined;
    const list: UploadResult[] = Array.isArray(results) && results.length > 0
      ? results.map((r) => ({ url: r.url, filename: r.filename ?? '', size: r.size ?? 0 }))
      : (Array.isArray(urls) ? urls : []).map((url) => ({ url, filename: '', size: 0 }));
    return list;
  }

  const results: UploadResult[] = [];
  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadFile(file, (progress) => {
      const overallProgress = ((i + progress / 100) / totalFiles) * 100;
      onProgress?.(overallProgress);
    }, folder);
    results.push(result);
  }

  return results;
} 