'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { CVInfo } from '@/types';
import { getCVPreviewUrl } from '@/lib/cloudinary-client';

interface CVUploadProps {
  currentCV?: CVInfo;
  onUploadSuccess?: (cv: CVInfo) => void;
  onDeleteSuccess?: () => void;
  className?: string;
  required?: boolean;
}

const CVUpload: React.FC<CVUploadProps> = ({
  currentCV,
  onUploadSuccess,
  onDeleteSuccess,
  className = '',
  required = false,
}) => {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return 'Hanya file PDF yang diperbolehkan';
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'Ukuran file maksimal 5MB';
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Reset image error state for new upload
        setImageError(false);
        onUploadSuccess?.(data.cv);
      } else {
        setError(data.error || 'Gagal mengunggah CV');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Terjadi kesalahan saat mengunggah CV');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDelete = async () => {
    if (!currentCV) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/cv/delete', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        onDeleteSuccess?.();
      } else {
        setError(data.error || 'Gagal menghapus CV');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Terjadi kesalahan saat menghapus CV');
    } finally {
      setDeleting(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (session?.user?.role !== 'pelamar_kerja') {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-lg font-bold">
          CV (PDF)
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>

      {currentCV ? (
        // Display current CV
        <div className="border-4 border-black rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* CV Preview Thumbnail */}
              <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                {getCVPreviewUrl(currentCV.publicId) && !imageError ? (
                  <img 
                    src={getCVPreviewUrl(currentCV.publicId) || undefined}
                    alt="CV Preview" 
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-red-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{currentCV.fileName}</p>
                <p className="text-sm text-gray-500">
                  Diunggah pada {new Date(currentCV.uploadedAt).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => window.open(currentCV.url, '_blank')}
                variant="default"
                size="sm"
              >
                Lihat
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                variant="default"
                size="sm"
              >
                {deleting ? 'Menghapus...' : 'Hapus'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Upload area
        <div
          className={`border-4 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-main bg-main/10'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                Seret dan lepas CV Anda di sini
              </p>
              <p className="text-gray-500">atau</p>
              <Button
                onClick={openFileDialog}
                disabled={uploading}
                className="mt-2"
              >
                {uploading ? 'Mengunggah...' : 'Pilih File'}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Format: PDF • Maksimal 5MB
            </p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-blue-600 text-sm">Mengunggah CV...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVUpload;