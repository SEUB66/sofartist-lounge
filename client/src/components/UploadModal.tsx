import { useState, useRef } from 'react';
import { X, Upload, Music, Image as ImageIcon, Disc } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useUser } from '@/contexts/UserContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

type UploadTab = 'mp3-only' | 'mp3-with-cover';

export function UploadModal({ isOpen, onClose, onUploadComplete }: UploadModalProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<UploadTab>('mp3-only');
  const [isDraggingMp3, setIsDraggingMp3] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [selectedMp3, setSelectedMp3] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const mp3InputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const getUploadUrlMutation = trpc.upload.getUploadUrl.useMutation();
  const addMediaMutation = trpc.upload.addMedia.useMutation();

  if (!isOpen) return null;

  const validateMp3 = (file: File): boolean => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
      toast.error('Please select an MP3 audio file');
      return false;
    }
    if (file.size > maxSize) {
      toast.error('File size must be less than 50MB');
      return false;
    }
    return true;
  };

  const validateImage = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB for images
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, GIF)');
      return false;
    }
    if (file.size > maxSize) {
      toast.error('Image size must be less than 10MB');
      return false;
    }
    return true;
  };

  const handleMp3Drop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingMp3(false);
    const file = e.dataTransfer.files[0];
    if (file && validateMp3(file)) {
      setSelectedMp3(file);
      // Auto-fill title from filename
      const title = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      setTrackTitle(title);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files[0];
    if (file && validateImage(file)) {
      setSelectedImage(file);
    }
  };

  const handleMp3Select = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateMp3(file)) {
      setSelectedMp3(file);
      const title = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      setTrackTitle(title);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateImage(file)) {
      setSelectedImage(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedMp3 || !user) {
      toast.error('Please select an MP3 file');
      return;
    }

    if (activeTab === 'mp3-with-cover' && !selectedImage) {
      toast.error('Please select a cover image');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let coverUrl = '/game-over.jpg'; // Default cover

      // Upload cover image first if provided
      if (activeTab === 'mp3-with-cover' && selectedImage) {
        setUploadProgress(10);
        
        const imageUpload = await getUploadUrlMutation.mutateAsync({
          userId: user.id,
          type: 'image',
          filename: selectedImage.name,
          contentType: selectedImage.type,
        });

        // Upload image with progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = 10 + Math.round((e.loaded / e.total) * 20);
              setUploadProgress(percentComplete);
            }
          });
          
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error('Image upload failed'));
            }
          });
          
          xhr.addEventListener('error', () => reject(new Error('Network error')));
          xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));
          
          xhr.open('PUT', imageUpload.uploadUrl);
          xhr.setRequestHeader('Content-Type', selectedImage.type);
          xhr.send(selectedImage);
        });
        
        coverUrl = imageUpload.publicUrl;
        setUploadProgress(30);
      }

      // Upload MP3
      setUploadProgress(40);
      
      const mp3Upload = await getUploadUrlMutation.mutateAsync({
        userId: user.id,
        type: 'music',
        filename: selectedMp3.name,
        contentType: selectedMp3.type || 'audio/mpeg',
      });

      // Upload MP3 with progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = 40 + Math.round((e.loaded / e.total) * 40);
            setUploadProgress(percentComplete);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(80);
            resolve();
          } else {
            reject(new Error('MP3 upload failed'));
          }
        });
        
        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));
        
        xhr.open('PUT', mp3Upload.uploadUrl);
        xhr.setRequestHeader('Content-Type', selectedMp3.type || 'audio/mpeg');
        xhr.send(selectedMp3);
      });

      // Save to database
      await addMediaMutation.mutateAsync({
        userId: user.id,
        type: 'music',
        title: trackTitle || selectedMp3.name.replace(/\.[^/.]+$/, ''),
        fileUrl: mp3Upload.publicUrl,
        coverUrl: coverUrl,
        fileKey: mp3Upload.key,
        mimeType: selectedMp3.type || 'audio/mpeg',
        size: selectedMp3.size,
      });

      setUploadProgress(100);
      toast.success('🎵 Track uploaded! Added to queue.');
      
      // Reset form
      setSelectedMp3(null);
      setSelectedImage(null);
      setTrackTitle('');
      setArtistName('');
      setUploadProgress(0);
      
      onUploadComplete?.();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-gray-900/98 via-purple-900/98 to-gray-900/98 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-gray-900/95 z-10">
          <h2 style={{ fontFamily: 'VT323, monospace' }} className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            📻 UPLOAD TO RADIO
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('mp3-only')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
              activeTab === 'mp3-only'
                ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
            style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}
          >
            <Music className="inline mr-2" size={18} />
            MP3 ONLY
          </button>
          <button
            onClick={() => setActiveTab('mp3-with-cover')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
              activeTab === 'mp3-with-cover'
                ? 'bg-gradient-to-r from-pink-600 to-orange-600 text-white shadow-lg'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
            style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}
          >
            <Disc className="inline mr-2" size={18} />
            IMAGE + MP3
          </button>
        </div>

        {/* Upload Areas */}
        <div className="p-6 space-y-4">
          {/* MP3 Upload Area */}
          <div>
            <label style={{ fontFamily: 'VT323, monospace' }} className="block text-lg text-cyan-400 mb-2">
              🎵 MP3 FILE
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingMp3(true); }}
              onDragLeave={() => setIsDraggingMp3(false)}
              onDrop={handleMp3Drop}
              onClick={() => mp3InputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDraggingMp3 ? 'border-cyan-400 bg-cyan-400/10' : 
                selectedMp3 ? 'border-green-400 bg-green-400/10' :
                'border-white/20 hover:border-white/40 hover:bg-white/5'
              }`}
            >
              <input ref={mp3InputRef} type="file" accept="audio/*,.mp3" onChange={handleMp3Select} className="hidden" />
              <Music size={36} className={`mx-auto mb-2 ${selectedMp3 ? 'text-green-400' : 'text-cyan-400'}`} />
              <p style={{ fontFamily: 'VT323, monospace' }} className="text-lg text-white">
                {selectedMp3 ? `✓ ${selectedMp3.name}` : 'Drop MP3 here or click to browse'}
              </p>
              {selectedMp3 && (
                <p className="text-sm text-white/60 mt-1">
                  {(selectedMp3.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>

          {/* Cover Image Upload Area (only for mp3-with-cover tab) */}
          {activeTab === 'mp3-with-cover' && (
            <div>
              <label style={{ fontFamily: 'VT323, monospace' }} className="block text-lg text-pink-400 mb-2">
                🖼️ COVER IMAGE
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
                onDragLeave={() => setIsDraggingImage(false)}
                onDrop={handleImageDrop}
                onClick={() => imageInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDraggingImage ? 'border-pink-400 bg-pink-400/10' : 
                  selectedImage ? 'border-green-400 bg-green-400/10' :
                  'border-white/20 hover:border-white/40 hover:bg-white/5'
                }`}
              >
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                {selectedImage ? (
                  <div className="flex items-center justify-center gap-4">
                    <img 
                      src={URL.createObjectURL(selectedImage)} 
                      alt="Cover preview" 
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="text-left">
                      <p style={{ fontFamily: 'VT323, monospace' }} className="text-lg text-white">
                        ✓ {selectedImage.name}
                      </p>
                      <p className="text-sm text-white/60">
                        {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={36} className="mx-auto mb-2 text-pink-400" />
                    <p style={{ fontFamily: 'VT323, monospace' }} className="text-lg text-white">
                      Drop cover image here or click to browse
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Track Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ fontFamily: 'VT323, monospace' }} className="block text-sm text-white/60 mb-1">
                TRACK TITLE
              </label>
              <input
                type="text"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                placeholder="Enter track title..."
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                style={{ fontFamily: 'VT323, monospace' }}
              />
            </div>
            <div>
              <label style={{ fontFamily: 'VT323, monospace' }} className="block text-sm text-white/60 mb-1">
                ARTIST NAME
              </label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Enter artist name..."
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                style={{ fontFamily: 'VT323, monospace' }}
              />
            </div>
          </div>

          {/* Progress Bar */}
          {uploading && uploadProgress > 0 && (
            <div className="mt-4">
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p style={{ fontFamily: 'VT323, monospace' }} className="text-center text-white/60 mt-2">
                {uploadProgress}% - {uploadProgress < 30 ? 'Uploading cover...' : uploadProgress < 80 ? 'Uploading MP3...' : 'Saving to database...'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/10 sticky bottom-0 bg-gray-900/95">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
            style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}
          >
            CANCEL
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedMp3 || uploading || (activeTab === 'mp3-with-cover' && !selectedImage)}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
              selectedMp3 && !uploading && (activeTab === 'mp3-only' || selectedImage)
                ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-lg'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
            style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}
          >
            {uploading ? '⏳ UPLOADING...' : '🚀 ADD TO QUEUE'}
          </button>
        </div>
      </div>
    </div>
  );
}
