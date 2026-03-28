'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  s3Key: string;
  uploadedAt: string;
  instanceId: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef(false);

  // Fetch instance ID
  useEffect(() => {
    const fetchInstanceId = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        setInstanceId(data.metadata.instanceId);
      } catch (err) {
        console.error('[UploadPage] Error fetching instance ID:', err);
      }
    };
    fetchInstanceId();
  }, []);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    const validFiles = newFiles.filter((file) => {
      // Check file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 50MB)`);
        return false;
      }

      // Check file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} has unsupported file type`);
        return false;
      }

      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverRef.current = true;
  };

  const handleDragLeave = () => {
    dragOverRef.current = false;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverRef.current = false;
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const uploaded: UploadedFile[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        console.log('[UploadPage] Uploading file:', file.name);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success && data.file) {
          uploaded.push({
            name: data.file.name,
            size: data.file.size,
            type: data.file.type,
            s3Key: data.file.s3Key,
            uploadedAt: new Date().toISOString(),
            instanceId: data.metadata.instanceId,
          });

          toast.success(`${file.name} uploaded successfully`);
          console.log('[UploadPage] File uploaded:', data.file.name);
        } else {
          setError(data.error || 'Upload failed');
          toast.error(`Failed to upload ${file.name}`);
          console.error('[UploadPage] Upload error:', data.error);
        }
      }

      setUploadedFiles((prev) => [...prev, ...uploaded]);
      setFiles([]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      toast.error('Upload failed: ' + errorMsg);
      console.error('[UploadPage] Upload error:', errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Header */}
        <div className="max-w-2xl mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Upload Event
          </h1>
          <p className="text-lg text-foreground/60">
            Share event details, promotional materials, or documentation. Uploads are processed and stored in S3-compatible storage.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            {/* Drag & Drop Zone */}
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-card/50"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Drag and drop files here
              </h3>
              <p className="text-foreground/60 mb-4">
                or click to select files
              </p>
              <p className="text-sm text-foreground/40">
                Supported: Images (JPG, PNG, GIF), Documents (PDF, DOCX)
              </p>
              <p className="text-sm text-foreground/40">
                Max file size: 50MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
              />
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mt-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">Upload Error</p>
                  <p className="text-sm text-red-600/70 dark:text-red-400/70">{error}</p>
                </div>
              </div>
            )}

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-foreground mb-4">Selected Files ({files.length})</h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-foreground/60">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-3 p-1 hover:bg-muted rounded transition-colors"
                      >
                        <X className="h-4 w-4 text-foreground/60" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Upload Button */}
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  size="lg"
                  className="w-full mt-4 gap-2"
                >
                  {uploading && <Spinner />}
                  {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Upload Info Card */}
              <div className="border border-border rounded-lg p-6 bg-card space-y-4">
                <h3 className="font-semibold text-foreground">Upload Info</h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-foreground/60 mb-1">Instance ID</p>
                    <p className="font-mono text-xs bg-muted/50 px-2 py-1 rounded text-foreground/80 break-all">
                      {instanceId || 'Loading...'}
                    </p>
                  </div>

                  <div>
                    <p className="text-foreground/60 mb-1">Storage Type</p>
                    <p className="text-foreground">S3-Ready</p>
                  </div>

                  <div>
                    <p className="text-foreground/60 mb-1">Max File Size</p>
                    <p className="text-foreground">50 MB</p>
                  </div>

                  <div>
                    <p className="text-foreground/60 mb-1">Allowed Types</p>
                    <p className="text-foreground text-xs">Images, PDF, Word</p>
                  </div>
                </div>
              </div>

              {/* Features Card */}
              <div className="border border-border rounded-lg p-6 bg-card space-y-4">
                <h3 className="font-semibold text-foreground">Features</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">Drag & drop support</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">File validation</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">Stateless design</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">AWS S3 ready</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-12 max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Upload History</h2>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card/50"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-foreground/60 mt-1">
                      Size: {formatFileSize(file.size)} • S3 Key: {file.s3Key}
                    </p>
                    <p className="text-xs text-foreground/40 mt-1">
                      Instance: {file.instanceId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer instanceId={instanceId} />
    </div>
  );
}
