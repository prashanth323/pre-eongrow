import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, RefreshCw, Link as LinkIcon, Check } from 'lucide-react';
import { DataService } from '../../services/dataService';
import { Button } from './Button';

export interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  variant?: 'logo' | 'banner' | 'avatar' | 'inline';
  folder?: string;
  bucket?: string;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label,
  hint,
  variant = 'logo',
  folder = 'uploads',
  bucket = 'public-uploads',
  maxSizeMB = 10,
  className = '',
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    if (disabled) return;
    setErrorMessage(null);

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`Image is too large. Max file size is ${maxSizeMB}MB.`);
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, WEBP, GIF, or SVG).');
      return;
    }

    setIsUploading(true);
    try {
      const res = await DataService.uploadImage(file, {
        bucket,
        folder,
        maxSizeMB,
      });

      if (res.success && res.url) {
        onChange(res.url);
        setShowUrlInput(false);
      } else {
        setErrorMessage(res.error || 'Failed to upload image. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // Reset file input so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setErrorMessage(null);
  };

  const handleApplyUrl = () => {
    if (urlDraft.trim()) {
      onChange(urlDraft.trim());
      setUrlDraft('');
      setShowUrlInput(false);
      setErrorMessage(null);
    }
  };

  // 1. RENDER AVATAR VARIANT
  if (variant === 'avatar') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && <label className="text-xs font-semibold text-[#171C19] block">{label}</label>}

        <div className="flex items-center gap-4">
          <div
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative w-20 h-20 rounded-full overflow-hidden border-2 transition-all cursor-pointer flex items-center justify-center flex-shrink-0 group ${
              isDragging
                ? 'border-black bg-black/[0.08] ring-4 ring-black/10'
                : 'border-black/[0.1] bg-black/[0.03] hover:border-black/30'
            }`}
          >
            {value ? (
              <img src={value} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-7 h-7 text-[#818A84]" />
            )}

            {/* Hover / Loading overlay */}
            <div
              className={`absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity ${
                isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="apple-press text-xs"
              >
                {value ? 'Change Photo' : 'Upload Photo'}
              </Button>

              {value && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 rounded-full text-[#818A84] hover:text-black hover:bg-black/[0.05] transition-colors"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#818A84]">
              {hint || `PNG, JPG, WEBP up to ${maxSizeMB}MB`}
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled || isUploading}
        />

        {errorMessage && <p className="text-[11px] text-red-600 font-medium">{errorMessage}</p>}
      </div>
    );
  }

  // 2. RENDER BANNER / COVER VARIANT
  if (variant === 'banner') {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#171C19]">{label}</label>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[11px] text-[#818A84] hover:text-black flex items-center gap-1 transition-colors"
            >
              <LinkIcon className="w-3 h-3" />
              <span>{showUrlInput ? 'Back to file upload' : 'Paste link'}</span>
            </button>
          </div>
        )}

        {showUrlInput ? (
          <div className="flex items-center gap-2">
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or direct image link"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              className="flex-1 p-2.5 bg-black/[0.03] border border-black/[0.08] rounded-xl text-xs text-[#171C19] focus:bg-white focus:border-black/30 focus:outline-none"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleApplyUrl}
              disabled={!urlDraft.trim()}
            >
              Apply
            </Button>
          </div>
        ) : value ? (
          <div className="relative rounded-2xl overflow-hidden border border-black/[0.08] group bg-black/[0.02]">
            <div className="aspect-[3/1] sm:aspect-[3.5/1] w-full max-h-48 overflow-hidden">
              <img src={value} alt="Banner preview" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/95 text-black hover:bg-white border-0 text-xs apple-press shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Replace Image
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="bg-white/95 text-red-600 hover:bg-white border-0 text-xs apple-press shadow-md"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-black bg-black/[0.05] ring-2 ring-black/10'
                : 'border-black/[0.1] bg-black/[0.015] hover:bg-black/[0.03] hover:border-black/25'
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-[#818A84]">
                <Loader2 className="w-6 h-6 animate-spin text-black" />
                <span className="text-xs font-medium text-[#171C19]">Uploading banner...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-black/[0.04] flex items-center justify-center text-black">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#171C19]">
                    Click to upload banner or drag and drop
                  </p>
                  <p className="text-[11px] text-[#818A84] mt-0.5">
                    {hint || `Landscape JPG, PNG, WEBP recommended (up to ${maxSizeMB}MB)`}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled || isUploading}
        />

        {errorMessage && <p className="text-[11px] text-red-600 font-medium">{errorMessage}</p>}
      </div>
    );
  }

  // 3. RENDER LOGO / SQUIRCLE VARIANT (Default)
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#171C19]">{label}</label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-[#818A84] hover:text-black flex items-center gap-1 transition-colors"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'Back to upload' : 'Paste link'}</span>
          </button>
        </div>
      )}

      {showUrlInput ? (
        <div className="flex items-center gap-2">
          <input
            type="url"
            placeholder="https://images.unsplash.com/... or logo link"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            className="flex-1 p-2 bg-black/[0.03] border border-black/[0.08] rounded-xl text-xs text-[#171C19] focus:bg-white focus:border-black/30 focus:outline-none"
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleApplyUrl}
            disabled={!urlDraft.trim()}
          >
            Apply
          </Button>
        </div>
      ) : value ? (
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-black/[0.08] bg-black/[0.015]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border border-black/[0.08] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs">
              <img src={value} alt="Logo preview" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#171C19] flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" /> Image uploaded
              </p>
              <p className="text-[10px] text-[#818A84]">Ready for listing</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs h-8 px-2.5 apple-press"
            >
              Replace
            </Button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-[#818A84] hover:text-red-600 hover:bg-black/[0.04] transition-colors"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer flex items-center justify-center gap-3 ${
            isDragging
              ? 'border-black bg-black/[0.05] ring-2 ring-black/10'
              : 'border-black/[0.1] bg-black/[0.015] hover:bg-black/[0.03] hover:border-black/25'
          }`}
        >
          {isUploading ? (
            <div className="flex items-center gap-2 text-[#818A84]">
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span className="text-xs font-medium text-[#171C19]">Uploading...</span>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg bg-black/[0.04] flex items-center justify-center text-black flex-shrink-0">
                <Upload className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-[#171C19]">
                  Upload image or drag & drop
                </p>
                <p className="text-[10px] text-[#818A84]">
                  {hint || `PNG, JPG, SVG, WEBP up to ${maxSizeMB}MB`}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled || isUploading}
      />

      {errorMessage && <p className="text-[11px] text-red-600 font-medium">{errorMessage}</p>}
    </div>
  );
};
