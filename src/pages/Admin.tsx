import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, FileItem } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Cloud, File, LogOut, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Admin() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [users, setUsers] = useState<Array<{ _id: string; email: string; role: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userFiles, setUserFiles] = useState<FileItem[]>([]);
  const [isLoadingUserFiles, setIsLoadingUserFiles] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const { user, token, logout, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading and for token to exist before making admin API calls
    if (!isLoading && token) {
      fetchAllFiles();
      fetchAccessRequests();
      fetchUsers();
    }
  }, [isLoading, token]);

  const fetchAllFiles = async () => {
    if (!token) return;
    
    try {
      const data = await api.getAllFiles(token);
      setFiles(data);
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchAccessRequests = async () => {
    if (!token) return;
    
    try {
      const requests = await api.getAccessRequests(token);
      setAccessRequests(requests);
    } catch (error) {
      toast.error('Failed to load access requests');
    }
  };

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const data = await api.getUsers(token);
      // API may return an object { users } or an array
      const list = Array.isArray(data) ? data : (data as any).users || [];
      setUsers(list as Array<{ _id: string; email: string; role: string }>);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const fetchFilesForUser = async (userId: string) => {
    if (!token) return;
    setSelectedUserId(userId);
    setIsLoadingUserFiles(true);
    try {
      const res = await api.getUserFiles(userId, token);
  const files = Array.isArray(res) ? res : ((res as any).files || []);
  setUserFiles(files as FileItem[]);
    } catch (error) {
      toast.error('Failed to load user files');
    } finally {
      setIsLoadingUserFiles(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!token) return;
    
    try {
      await api.deleteFile(fileId, token);
      toast.success('File deleted');
      fetchAllFiles();
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
      toast.success('File downloaded successfully');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleApproveAccess = async (requestId: string, permission: 'view' | 'edit') => {
    if (!token) return;

    try {
      await api.approveAccess(requestId, permission, token);
      toast.success('Access request approved');
      fetchAccessRequests();
    } catch (error) {
      toast.error('Failed to approve access request');
    }
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
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Users Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Users</h2>
            <p className="text-muted-foreground mb-6">Click a user to view their files</p>
            {users.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {users.map((u) => (
                  <div key={u._id} className="p-4 border rounded-md flex items-center justify-between">
                    <div>
                      <div className="font-medium">{u.email}</div>
                      <div className="text-sm text-muted-foreground">{u.role}</div>
                    </div>
                    <div>
                      <Button size="sm" onClick={() => fetchFilesForUser(u._id)}>View Files</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Files Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">All Files</h2>
            <p className="text-muted-foreground mb-6">View and manage all user files. Select a user to view only their files.</p>

            {isLoadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12">
                <File className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No files in system</h3>
                <p className="text-muted-foreground">No users have uploaded files yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <Card key={file._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <File className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{file.originalName}</h3>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>{formatFileSize(file.size)}</span>
                              <span>Owner: {file.owner?.email ?? file.userId ?? '—'}</span>
                              <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(file._id, file.originalName)}
                          >
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!token) return;
                              try {
                                const { link } = await api.generateShareLink(file._id, token);
                                await navigator.clipboard.writeText(link);
                                toast.success('Share link copied to clipboard');
                                const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`;
                                window.open(wa, '_blank');
                              } catch (err) {
                                toast.error('Failed to generate link');
                              }
                            }}
                          >
                            Link
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(file._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected User Files Section */}
        {selectedUserId && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Files for user</h2>
                  <p className="text-sm text-muted-foreground">Showing files for selected user</p>
                </div>
                <div>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedUserId(null); setUserFiles([]); }}>
                    Close
                  </Button>
                </div>
              </div>

              {isLoadingUserFiles ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : userFiles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No files for this user</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userFiles.map((file) => (
                    <Card key={file._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <File className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{file.originalName}</h3>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span>{formatFileSize(file.size)}</span>
                                <span>Owner: {file.owner?.email ?? file.userId ?? '—'}</span>
                                <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(file._id, file.originalName)}
                            >
                              Download
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(file._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Access Requests Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Access Requests</h2>
            <p className="text-muted-foreground mb-6">Manage file access requests from users</p>

            {accessRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending access requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {accessRequests.map((request) => (
                  <Card key={request._id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{request.requestedBy.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Requesting access to: {request.file.originalName}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveAccess(request._id, 'view')}
                          >
                            Grant View Access
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveAccess(request._id, 'edit')}
                          >
                            Grant Edit Access
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
