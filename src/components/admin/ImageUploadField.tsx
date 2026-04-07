'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  showPreview?: boolean;
  previewClassName?: string;
  placeholder?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  accept = 'image/*',
  showPreview = true,
  previewClassName = 'w-20 h-20',
  placeholder = '輸入圖片連結或上傳檔案',
}: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
      // reset so same file can be re-selected
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <label className="text-xs text-gray-500 uppercase tracking-widest">{label}</label>
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gold transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          {uploading ? '上傳中...' : '上傳圖片'}
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-gold/50 focus:outline-none transition-colors"
      />
      {showPreview && value && (
        <div className={`mt-2 rounded-lg bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center ${previewClassName}`}>
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
          <ImageIcon size={20} className="text-zinc-600 hidden" />
        </div>
      )}
    </div>
  );
}
