import { useState, useRef } from 'react';
import { X, Upload, Music, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useUser } from '@/contexts/UserContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UploadTab = 'mp3' | 'image';

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<UploadTab>('mp3');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUploadUrlMutation = trpc.upload.getUploadUrl.useMutation();
  const addMediaMutation = trpc.upload.addMedia.useMutation();

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (activeTab === 'mp3') {
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select an audio file');
        return;
      }
    } else {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
    }
    
    if (file.size > maxSize) {
      toast.error('File size must be less than 50MB');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // 1. Obtenir l'URL présignée
      console.log('Getting upload URL...');
      const { uploadUrl, publicUrl, key } = await getUploadUrlMutation.mutateAsync({
        userId: user.id,
        type: activeTab === 'mp3' ? 'music' : 'image',
        filename: selectedFile.name,
        contentType: selectedFile.type,
      });

      setUploadProgress(25);

      // 2. Uploader le fichier vers S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('S3 upload failed');
      }

      setUploadProgress(75);

      // 3. Enregistrer dans la base de données
      await addMediaMutation.mutateAsync({
        userId: user.id,
        type: activeTab === 'mp3' ? 'music' : 'image',
        title: selectedFile.name.replace(/\.[^/.]+$/, ''), // Remove extension
        fileUrl: publicUrl,
        fileKey: key,
        mimeType: selectedFile.type,
        size: selectedFile.size,
      });

      setUploadProgress(100);
      
      toast.success(`${activeTab === 'mp3' ? 'Track' : 'Image'} uploaded successfully!`);
      setSelectedFile(null);
      setUploadProgress(0);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-gray-900/95 via-purple-900/95 to-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 style={{ fontFamily: 'VT323, monospace' }} className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            UPLOAD FILES
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('mp3')}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
              activeTab === 'mp3'
                ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
            style={{ fontFamily: 'VT323, monospace', fontSize: '20px' }}
          >
            <Music className="inline mr-2" size={20} />
            MP3 TRACKS
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
              activeTab === 'image'
                ? 'bg-gradient-to-r from-pink-600 to-orange-600 text-white shadow-lg'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
            style={{ fontFamily: 'VT323, monospace', fontSize: '20px' }}
          >
            <ImageIcon className="inline mr-2" size={20} />
            IMAGES
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-cyan-400 bg-cyan-400/10'
                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={activeTab === 'mp3' ? 'audio/*' : 'image/*'}
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Upload size={48} className="mx-auto mb-4 text-cyan-400" />
            
            <p style={{ fontFamily: 'VT323, monospace' }} className="text-xl text-white mb-2">
              {selectedFile ? selectedFile.name : 'Drop your file here or click to browse'}
            </p>
            
            <p className="text-sm text-white/60">
              {activeTab === 'mp3' 
                ? 'Supported formats: MP3, WAV, OGG (Max 50MB)'
                : 'Supported formats: JPG, PNG, GIF (Max 50MB)'}
            </p>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p style={{ fontFamily: 'VT323, monospace' }} className="text-lg text-white">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-white/60">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                {!uploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X size={20} className="text-white" />
                  </button>
                )}
              </div>
              
              {/* Progress Bar */}
              {uploading && uploadProgress > 0 && (
                <div className="mt-3">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/60 mt-1 text-center">
                    {uploadProgress}% uploaded
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
            style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}
          >
            CANCEL
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
              selectedFile && !uploading
                ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-lg'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
            style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}
          >
            {uploading ? 'UPLOADING...' : 'UPLOAD'}
          </button>
        </div>
      </div>
    </div>
  );
}
