'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, GripVertical, Loader2, AlertCircle } from 'lucide-react';
// Using regular img tag for admin previews to ensure immediate display
import { Button } from '@/components/ui/button';
import { cn, normalizeSupabaseUrl, normalizeSupabaseUrls } from '@/lib/utils';
import { uploadMultipleFiles } from '@/lib/upload-service';
import { useToast } from '@/components/ui/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  maxFiles?: number;
  initialImages?: string[];
  folder?: string;
}

interface SortableImageProps {
  image: string;
  index: number;
  onRemove: () => void;
}

function SortableImage({ image, index, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group aspect-square rounded-lg overflow-hidden",
        isDragging && "opacity-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1 rounded-md bg-black/50 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-white" />
      </div>
      <img
        src={image}
        alt={`Uploaded image ${index + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error('Image failed to load:', image);
          (e.target as HTMLImageElement).src = '/placeholder.svg';
        }}
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ImageUpload({ onImagesChange, maxFiles = 10, initialImages = [], folder = 'products' }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(() => normalizeSupabaseUrls(initialImages));
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();
  const hasInitializedRef = useRef(false);
  const prevInitialImagesRef = useRef<string>('');
  
  // Only sync with initialImages on mount or when it meaningfully changes
  // This prevents resetting uploaded images when the modal reopens or form re-renders
  useEffect(() => {
    const normalizedInitial = normalizeSupabaseUrls(initialImages);
    const currentKey = JSON.stringify(normalizedInitial.sort());
    
    // On first mount, always use initialImages
    if (!hasInitializedRef.current) {
      setImages(normalizedInitial);
      prevInitialImagesRef.current = currentKey;
      hasInitializedRef.current = true;
      console.log('[ImageUpload] Initialized with images:', normalizedInitial.length);
      return;
    }
    
    // After initialization, only update if:
    // 1. initialImages has actually changed (different post being edited)
    // 2. AND we currently have no images (so we don't overwrite uploaded ones)
    // 3. OR if initialImages has more images than we currently have (new data loaded)
    if (currentKey !== prevInitialImagesRef.current) {
      const currentImagesCount = images.length;
      const newImagesCount = normalizedInitial.length;
      
      // Only update if:
      // - We have no images currently, OR
      // - The new initialImages has more images (data was loaded from server)
      // - But NOT if we have images and new data is empty (preserve uploaded images)
      if (currentImagesCount === 0) {
        // No images currently, safe to set from initialImages
        setImages(normalizedInitial);
        prevInitialImagesRef.current = currentKey;
        console.log('[ImageUpload] Updated from empty to:', normalizedInitial.length, 'images');
      } else if (newImagesCount > currentImagesCount && normalizedInitial.length > 0) {
        // New data has more images, likely loaded from server
        setImages(normalizedInitial);
        prevInitialImagesRef.current = currentKey;
        console.log('[ImageUpload] Updated with new data:', normalizedInitial.length, 'images');
      } else {
        // Preserve current images, don't overwrite with empty or fewer images
        console.log('[ImageUpload] Preserving current images:', currentImagesCount, 'vs new:', newImagesCount);
      }
    }
  }, [initialImages]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('[ImageUpload] onDrop callback triggered');
    console.log('[ImageUpload] acceptedFiles:', acceptedFiles);
    
    if (!acceptedFiles || acceptedFiles.length === 0) {
      console.warn('[ImageUpload] No files provided to onDrop');
      return;
    }

    // Validate max files before processing
    if (images.length + acceptedFiles.length > maxFiles) {
      const allowed = maxFiles - images.length;
      const errorMessage = `You can only upload ${allowed} more image(s). Maximum ${maxFiles} images allowed.`;
      setUploadError(errorMessage);
      toast({
        title: 'Upload Limit Reached',
        description: errorMessage,
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('[ImageUpload] Setting isUploading to true');
      setIsUploading(true);
      setUploadError(null);
      
      console.log('[ImageUpload] Starting upload for', acceptedFiles.length, 'file(s)');
      console.log('[ImageUpload] Files:', acceptedFiles.map(f => ({ 
        name: f.name, 
        size: f.size, 
        type: f.type,
        lastModified: f.lastModified
      })));
      
      console.log('[ImageUpload] Calling uploadMultipleFiles with folder:', folder);
      const uploadResults = await uploadMultipleFiles(acceptedFiles, (progress) => {
        setUploadProgress(progress);
        console.log('[ImageUpload] Upload progress:', Math.round(progress) + '%');
      }, folder);
      
      console.log('[ImageUpload] Upload results received:', uploadResults);
      
      if (!uploadResults || uploadResults.length === 0) {
        throw new Error('No files were uploaded. Please try again.');
      }
      
      console.log('[ImageUpload] Processing upload results...');
      const newImages = uploadResults
        .map(result => {
          const normalized = normalizeSupabaseUrl(result.url);
          console.log('[ImageUpload] Normalized URL:', normalized, 'from', result.url);
          return normalized;
        })
        .filter(Boolean); // Filter out any empty URLs
      
      console.log('[ImageUpload] Processed images:', newImages);
      
      if (newImages.length === 0) {
        throw new Error('Failed to process uploaded images. Please check file format and try again.');
      }
      
      const updatedImages = [...images, ...newImages].slice(0, maxFiles);
      console.log('[ImageUpload] Updating images state:', {
        totalImages: updatedImages.length,
        images: updatedImages,
        newImagesAdded: newImages.length
      });
      setImages(updatedImages);
      console.log('[ImageUpload] Calling onImagesChange with:', updatedImages);
      onImagesChange(updatedImages);
      
      console.log('[ImageUpload] Showing success toast');
      toast({
        title: 'Upload Successful',
        description: `Successfully uploaded ${newImages.length} image(s)`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to upload images. Please check your connection and try again.';
      
      console.error('[ImageUpload] Upload error caught:', error);
      console.error('[ImageUpload] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        cause: error instanceof Error ? (error as any).cause : undefined
      });
      setUploadError(errorMessage);
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      console.log('[ImageUpload] Setting isUploading to false');
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [images, maxFiles, onImagesChange, toast, folder]);

  const onDropRejected = useCallback((fileRejections: any[]) => {
    console.error('[ImageUpload] Files rejected:', fileRejections);
    const reasons = fileRejections.map(rejection => {
      const errors = rejection.errors.map((err: any) => err.message).join(', ');
      return `${rejection.file.name}: ${errors}`;
    }).join('; ');
    
    const errorMessage = `File upload rejected: ${reasons}`;
    console.error('[ImageUpload]', errorMessage);
    setUploadError(errorMessage);
    
    toast({
      title: 'Upload Rejected',
      description: errorMessage,
      variant: 'destructive',
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive, fileRejections, open } = useDropzone({
    onDrop: onDrop, // Use the async onDrop callback directly
    onDropRejected: onDropRejected, // Handle rejected files separately
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: maxFiles - images.length,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading || images.length >= maxFiles,
    multiple: true,
    noClick: false,
    noKeyboard: false,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string);
      const newIndex = images.indexOf(over.id as string);
      const newImages = arrayMove(images, oldIndex, newIndex);
      setImages(newImages);
      onImagesChange(newImages);
    }
  };

  return (
    <div className="space-y-4">
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Upload Error</p>
            <p className="text-sm text-red-700 mt-1">{uploadError}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setUploadError(null)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
      
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          (images.length >= maxFiles || isUploading) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="space-y-2">
            <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {isDragActive
                ? "Drop the images here"
                : "Drag & drop images here, or click to select files"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {images.length}/{maxFiles} images
            </p>
            {images.length >= maxFiles && (
              <p className="text-xs text-orange-600 mt-2 font-medium">
                Maximum number of images reached
              </p>
            )}
          </>
        )}
      </div>

      {fileRejections && fileRejections.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            {fileRejections.length} file(s) were rejected. Check console for details.
          </p>
        </div>
      )}
      
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <SortableContext items={images} strategy={verticalListSortingStrategy}>
              {images.map((image, index) => (
                <SortableImage
                  key={image}
                  image={image}
                  index={index}
                  onRemove={() => removeImage(index)}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      )}
    </div>
  );
} 