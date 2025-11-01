import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, FileItem } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Cloud, Upload, Download, Trash2, Share2, File, LogOut, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [sharedFiles, setSharedFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, token, logout } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    if (!token) return;
    
    try {
      const data = await api.getFiles(token);
      setFiles(data.owned || []);
      setSharedFiles(data.shared || []);
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(true);
    try {
      await api.uploadFile(file, token);
      toast.success('File uploaded successfully');
      fetchFiles();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!token) return;
    
    try {
      await api.deleteFile(fileId, token);
      toast.success('File deleted');
      fetchFiles();
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleShare = async (fileId: string) => {
    if (!token) return;
    
    try {
      // Get the user ID to share with (you might want to implement a modal or input for this)
      const shareEmail = prompt('Enter the email of the user to share with:');
      if (!shareEmail) return;

      // Use the api helper to resolve user id by email
      const { userId } = await api.findUserByEmail(shareEmail, token);
      await api.shareFile(fileId, userId, 'view', token);
      toast.success('File shared successfully');
      fetchFiles();
    } catch (error) {
      toast.error('Failed to share file');
    }
  };

  const handleDownload = async (fileId: string, filename: string) => {
    if (!token) return;
    
    try {
      const blob = await api.downloadFile(fileId, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('File downloaded');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
              <Cloud className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Mini Drive</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Files</h2>
            <p className="text-muted-foreground">Upload and manage your files</p>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="mr-2">
                  Admin Panel
                </Button>
              </Link>
            )}
          
            <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button disabled={isUploading} asChild>
                <span className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </span>
              </Button>
            </label>
          </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : files.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <File className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No files yet</h3>
              <p className="text-muted-foreground">Upload your first file to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold mb-2">My Files</h3>
              <div className="space-y-4">
                {files.map((file) => (
                  <Card key={file._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <File className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{file.originalName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(file._id, file.originalName)}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(file._id)}
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (!token) return;
                        try {
                          const { link } = await api.generateShareLink(file._id, token);
                          // copy to clipboard
                          await navigator.clipboard.writeText(link);
                          toast.success('Share link copied to clipboard');
                          // offer WhatsApp share
                          const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`;
                          window.open(wa, '_blank');
                        } catch (err) {
                          toast.error('Failed to generate link');
                        }
                      }}
                      className="flex-1"
                    >
                      Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(file._id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Shared With Me</h3>
              <div className="space-y-4">
                {sharedFiles.map((file) => (
                  <Card key={file._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <File className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{file.originalName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(file.uploadDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">Permission: {file.userPermission ?? 'view'}</p>
                          <p className="text-xs text-muted-foreground">Owner: {file.owner?.email ?? '—'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(file._id, file.originalName)}
                          className="flex-1"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {/* If user has edit permission, show delete; otherwise hide */}
                        {file.userPermission === 'edit' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(file._id)}
                            className="flex-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
