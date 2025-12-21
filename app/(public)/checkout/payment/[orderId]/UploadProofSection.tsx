// app/(public)/checkout/payment/[orderId]/UploadProofSection.tsx
'use client';

import { useRef, useState } from 'react';

interface UploadProofSectionProps {
  uploadedFiles: File[];
  onFileUpload: (files: File[]) => void;
  onSubmit: () => void;
  onMarkAsPaid: () => void;
  uploading: boolean;
  hasStartedPayment: boolean;
}

interface FileWithId extends File {
  id: string;
}

export default function UploadProofSection({
  uploadedFiles,
  onFileUpload,
  onSubmit,
  onMarkAsPaid,
  uploading,
  hasStartedPayment
}: UploadProofSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };
  
  const processFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf'
      ];
      
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024;
      
      return isValidType && isValidSize;
    });
    
    if (validFiles.length > 0) {
      const filesWithIds = validFiles.map(file => {
        const fileWithId = file as FileWithId;
        fileWithId.id = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return fileWithId;
      });
      
      onFileUpload([...uploadedFiles, ...filesWithIds]);
    } else {
      alert('Please upload only image files (JPG, PNG, GIF, WebP) or PDF files under 10MB');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeFile = (fileId: string) => {
    const newFiles = uploadedFiles.filter(file => {
      const fileWithId = file as FileWithId;
      return fileWithId.id !== fileId;
    });
    onFileUpload(newFiles);
  };
  
  const getFileIcon = (file: File) => {
    const fileType = file.type || '';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    return '📎';
  };
  
  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes < 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-soft p-8 border border-[#f5c8c8]/30">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold font-heading text-[#800020]">Upload Proof of Payment</h2>
      </div>
      
      <div className="space-y-6">
        {!hasStartedPayment && (
          <div className="bg-linear-to-r from-[#f5c8c8]/30 to-[#f7e7ce]/30 border border-[#f5c8c8] rounded-xl p-4">
            <div className="flex items-start">
              <div className="shrink-0 w-8 h-8 bg-[#800020] text-white rounded-full flex items-center justify-center text-sm mr-3">
                💡
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#800020]">Ready to upload?</h3>
                <p className="text-sm text-gray-700 mt-1">
                  Upload your payment proof anytime. Your files are saved automatically.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* File Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer
            transition-all duration-300 transform hover:scale-[1.01]
            ${dragOver 
              ? 'border-[#800020] bg-linear-to-r from-[#f5c8c8]/20 to-[#f7e7ce]/20 scale-[1.01]' 
              : 'border-gray-300 hover:border-[#800020] hover:bg-[#faf9f6]'
            }
          `}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-[#f5c8c8] to-[#f7e7ce] rounded-full flex items-center justify-center">
            <span className="text-3xl">📤</span>
          </div>
          <div className="font-bold text-gray-800 text-lg">
            {dragOver ? 'Drop files here' : 'Click to upload proof'}
          </div>
          <div className="text-gray-600 mt-2">
            Screenshot, photo, or PDF of bank transfer
          </div>
          <div className="text-sm text-gray-500 mt-3">
            Max 10MB • JPG, PNG, GIF, PDF
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.pdf"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        
        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center">
              <span className="bg-[#800020] text-white w-6 h-6 rounded-full text-sm flex items-center justify-center mr-2">
                {uploadedFiles.length}
              </span>
              Selected Files
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {uploadedFiles.map((file, index) => {
                const fileWithId = file as FileWithId;
                const fileId = fileWithId.id || `${file.name}-${index}`;
                
                return (
                  <div
                    key={fileId}
                    className="flex items-center justify-between p-4 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] rounded-xl border border-gray-100 hover:border-[#f5c8c8] transition-all duration-300 hover:shadow-sm"
                  >
                    <div className="flex items-center grow min-w-0">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm mr-3">
                        <span className="text-2xl">{getFileIcon(file)}</span>
                      </div>
                      <div className="grow min-w-0">
                        <div className="font-semibold text-gray-800 truncate text-sm">{file.name}</div>
                        <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                          <span className="bg-gray-100 px-2 py-1 rounded-full">{formatFileSize(file.size)}</span>
                          <span className="bg-gray-100 px-2 py-1 rounded-full">{file.type?.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(fileId)}
                      className="w-8 h-8 bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-full flex items-center justify-center text-sm ml-2 shrink-0 transition-all duration-300"
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          <button
            onClick={onSubmit}
            disabled={uploading || uploadedFiles.length === 0}
            className="w-full bg-linear-to-r from-[#800020] to-[#a00030] text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              `Submit ${uploadedFiles.length} File${uploadedFiles.length !== 1 ? 's' : ''}`
            )}
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>
          
          <button
            onClick={onMarkAsPaid}
            disabled={uploading}
            className="w-full bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] text-gray-800 py-4 rounded-xl font-bold border-2 border-[#f5c8c8] hover:border-[#800020]/30 hover:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark as Paid (No Proof)
          </button>
          
          <p className="text-sm text-gray-600 text-center px-4">
            Use this if you&apos;ve completed the transfer but can&apos;t upload proof.
            Our team will contact you for verification.
          </p>
        </div>
      </div>
    </div>
  );
}