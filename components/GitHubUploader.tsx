'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, X, File, Trash2, Eye, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface GitHubFile {
  name: string;
  path: string;
  downloadUrl: string;
  size: number;
  gitHubUrl: string;
}

interface GitHubUploaderProps {
  year: string;
  semester: string;
  branch: string;
  subject: string;
  moduleId: string;
  onFileUploaded?: (file: GitHubFile) => void;
  onFileDeleted?: (fileName: string) => void;
  onFileSelected?: (file: GitHubFile) => void;
  className?: string;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  fileName: string;
  error: string | null;
}

const GitHubUploader: React.FC<GitHubUploaderProps> = ({
  year,
  semester,
  branch,
  subject,
  moduleId,
  onFileUploaded,
  onFileDeleted,
  onFileSelected,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStates, setUploadStates] = useState<UploadState[]>([]);
  const [existingFiles, setExistingFiles] = useState<GitHubFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    file: GitHubFile | null;
  }>({
    isOpen: false,
    file: null
  });

  // Load existing files
  const loadExistingFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const response = await fetch(
        `/api/github/upload?year=${year}&semester=${semester}&branch=${branch}&subject=${subject}&moduleId=${moduleId}`
      );

      if (!response.ok) {
        throw new Error('Failed to load files');
      }

      const data = await response.json();
      setExistingFiles(data.files || []);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load existing files');
    } finally {
      setLoadingFiles(false);
    }
  }, [year, semester, branch, subject, moduleId]);

  // Load files on component mount
  React.useEffect(() => {
    loadExistingFiles();
  }, [loadExistingFiles]);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:application/pdf;base64, prefix
        resolve(base64.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    const pdfFiles = Array.from(files).filter(file =>
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfFiles.length === 0) {
      toast.error('Please select only PDF files');
      return;
    }

    if (pdfFiles.length !== files.length) {
      toast.warning('Only PDF files will be uploaded');
    }

    setIsUploading(true);
    const newUploadStates: UploadState[] = pdfFiles.map(file => ({
      uploading: true,
      progress: 0,
      fileName: file.name,
      error: null
    }));
    setUploadStates(newUploadStates);

    // Upload files one by one
    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];

      try {
        // Update progress for current file
        setUploadStates(prev => prev.map((state, index) =>
          index === i ? { ...state, progress: 25 } : state
        ));

        // Convert to base64
        const base64Content = await fileToBase64(file);

        setUploadStates(prev => prev.map((state, index) =>
          index === i ? { ...state, progress: 50 } : state
        ));

        // Upload to GitHub
        const response = await fetch('/api/github/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            content: base64Content,
            year,
            semester,
            branch,
            subject,
            moduleId,
          }),
        });

        setUploadStates(prev => prev.map((state, index) =>
          index === i ? { ...state, progress: 75 } : state
        ));

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();

        setUploadStates(prev => prev.map((state, index) =>
          index === i ? { ...state, progress: 100, uploading: false } : state
        ));

        // Add to existing files
        setExistingFiles(prev => [...prev, result.file]);

        // Call callback
        onFileUploaded?.(result.file);

        // Show appropriate success message
        if (result.originalFileName) {
          toast.success(`${file.name} uploaded as "${result.file.name}" (name sanitized for GitHub compatibility)`);
        } else {
          toast.success(`${file.name} uploaded successfully`);
        }

      } catch (error) {
        console.error('Upload error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';

        setUploadStates(prev => prev.map((state, index) =>
          index === i ? {
            ...state,
            uploading: false,
            progress: 0,
            error: errorMessage
          } : state
        ));

        toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
      }
    }

    // Clear upload states after a delay
    setTimeout(() => {
      setUploadStates([]);
      setIsUploading(false);
    }, 3000);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file deletion
  const handleDeleteFile = async (file: GitHubFile) => {
    try {
      const response = await fetch('/api/github/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: file.path,
          message: `Delete ${file.name}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Remove from existing files
      setExistingFiles(prev => prev.filter(f => f.path !== file.path));
      onFileDeleted?.(file.name);

      toast.success(`${file.name} deleted successfully`);
      setDeleteModal({ isOpen: false, file: null });

    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      {/* Upload Section */}
      <Card className="bg-card border border-border mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload PDF Files</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />

          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Upload PDF Files
            </h3>
            <p className="text-muted-foreground mb-4">
              Select single or multiple PDF files to upload to GitHub
            </p>
            <Button
              onClick={handleFileSelect}
              disabled={isUploading}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Select PDF Files
                </>
              )}
            </Button>
          </div>

          {/* Upload Progress */}
          {uploadStates.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-medium text-foreground">Upload Progress</h4>
              {uploadStates.map((state, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{state.fileName}</span>
                    {state.uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : state.error ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  {state.uploading && (
                    <Progress value={state.progress} className="h-2" />
                  )}
                  {state.error && (
                    <p className="text-sm text-red-500">{state.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Files */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <File className="w-5 h-5" />
              <span>Uploaded Files</span>
            </CardTitle>
            <Button
              onClick={loadExistingFiles}
              variant="outline"
              size="sm"
              disabled={loadingFiles}
            >
              {loadingFiles ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingFiles ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Loading files...</p>
            </div>
          ) : existingFiles.length === 0 ? (
            <div className="text-center py-8">
              <File className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No files uploaded</h3>
              <p className="text-muted-foreground">Upload some PDF files to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {existingFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                      <File className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{file.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <Badge variant="secondary" className="text-xs">PDF</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => onFileSelected?.(file)}
                      size="sm"
                      variant="outline"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setDeleteModal({ isOpen: true, file })}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModal.isOpen} onOpenChange={(open) => setDeleteModal({ isOpen: open, file: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteModal.file?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ isOpen: false, file: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteModal.file && handleDeleteFile(deleteModal.file)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GitHubUploader; 