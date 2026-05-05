'use client';

import { useRef, useState, DragEvent } from 'react';
import { Upload, Loader2, Image as ImageIcon, X } from 'lucide-react';

import imageCompression from 'browser-image-compression';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  placeholder?: string;
  className?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  accept = 'image/*',
  placeholder = '點擊或拖曳圖片至此處上傳',
  className = '',
}: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setErrorMsg(null);
    try {
      // 在前端進行圖片壓縮
      const options = {
        maxSizeMB: 1, // 最大不超過 1MB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      const formData = new FormData();
      // 使用壓縮後的檔案
      formData.append('file', compressedFile, file.name);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      
      if (!res.ok) {
        throw new Error(data.error || '上傳失敗');
      }
      
      if (data.url) {
        onChange(data.url);
      }
    } catch (err: any) {
      console.error('Upload failed', err);
      setErrorMsg(err.message || '上傳發生錯誤');
      alert('上傳失敗: ' + (err.message || '未知錯誤'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    }
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-end mb-2">
        <label className="text-xs text-gray-500 uppercase tracking-widest">{label}</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
          >
            <X size={12} /> 移除圖片
          </button>
        )}
      </div>

      <div
        className={`relative w-full rounded-xl border-2 border-dashed overflow-hidden transition-all duration-200 
          ${isDragging ? 'border-gold bg-gold/5' : 'border-white/10 bg-zinc-900/50 hover:border-gold/30 hover:bg-zinc-800/50'}
          ${value ? 'aspect-[4/3]' : 'h-48'}
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />

        {value ? (
          <div className="relative w-full h-full group">
            <img
              src={value}
              alt="preview"
              className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-50"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center hidden">
               <ImageIcon size={32} className="text-zinc-600" />
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <button
                 type="button"
                 onClick={() => fileRef.current?.click()}
                 className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gold hover:text-black transition-colors"
               >
                 <Upload size={16} /> 更換圖片
               </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-500 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={32} className="animate-spin text-gold" />
                <span className="text-sm">圖片上傳中...</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 transition-colors">
                  <ImageIcon size={24} />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-medium text-gray-300">{placeholder}</span>
                  <span className="text-xs text-gray-500">支援 JPG, PNG, WEBP</span>
                </div>
              </>
            )}
          </button>
        )}
      </div>
      
      {errorMsg && (
        <p className="mt-2 text-xs text-red-400">{errorMsg}</p>
      )}

      <div className="mt-3 relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="或直接貼上圖片網址"
          className="w-full bg-zinc-950 border border-white/5 rounded-lg px-4 py-2 text-xs text-gray-400 focus:text-white focus:border-gold/50 focus:outline-none transition-colors"
        />
      </div>
    </div>
  );
}
