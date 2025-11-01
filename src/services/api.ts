const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface FileItem {
  _id: string;
  filename: string;
  originalName: string;
  size: number;
  uploadDate: string;
  userId?: string;
  owner?: {
    _id: string;
    email: string;
  };
  userPermission?: 'view' | 'edit' | null;
  shared?: boolean;
}

export const api = {
  // Internal helper: include token from param or localStorage and handle 401 globally
  async _fetchWithAuth(input: RequestInfo, init: RequestInit = {}, token?: string) {
    const authToken = token || localStorage.getItem('miniDrive:token');
    const headers = new Headers(init.headers || {});
    if (authToken) headers.set('Authorization', `Bearer ${authToken}`);
    const res = await fetch(input, { ...init, headers });
    if (res.status === 401) {
      // Clear stored token on unauthorized to force re-login
      try { localStorage.removeItem('miniDrive:token'); } catch (e) {}
      // Notify app of unauthorized so it can react (logout)
      try { window.dispatchEvent(new Event('miniDrive:unauthorized')); } catch (e) {}
      throw new Error('Unauthorized');
    }
    return res;
  },
  async findUserByEmail(email: string, token: string): Promise<{ userId: string }> {
    const response = await api._fetchWithAuth(`${API_BASE_URL}/api/users/find`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }, token);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'User not found');
    }

    return response.json();
  },
  async uploadFile(file: File, token: string): Promise<FileItem> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api._fetchWithAuth(`${API_BASE_URL}/api/files/upload`, {
      method: 'POST',
      body: formData,
    }, token);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'File upload failed');
    }

    return response.json();
  },

  async getFiles(token: string): Promise<{ owned: FileItem[]; shared: FileItem[] }> {
    const response = await api._fetchWithAuth(`${API_BASE_URL}/api/files/my-files`, {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    return response.json();
  },

  async getAllFiles(token: string): Promise<FileItem[]> {
    const response = await api._fetchWithAuth(`${API_BASE_URL}/api/files/all`, {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw new Error('Failed to fetch all files');
    }

    return response.json();
  },

  async deleteFile(fileId: string, token: string): Promise<void> {
    const response = await api._fetchWithAuth(`${API_BASE_URL}/api/files/${fileId}`, {
      method: 'DELETE',
    }, token);

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
  },

  async shareFile(fileId: string, userId: string, permission: 'view' | 'edit', token: string): Promise<void> {
    const response = await api._fetchWithAuth(`${API_BASE_URL}/api/files/${fileId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, permission }),
    }, token);

    if (!response.ok) {
      throw new Error('Failed to share file');
    }
  },
  async generateShareLink(fileId: string, token: string): Promise<{ link: string, token: string }> {
    const response = await api._fetchWithAuth(`${API_BASE_URL}/api/files/${fileId}/generate-link`, {
      method: 'POST',
    }, token);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to generate share link');
    }

    return response.json();
  },

  async promoteUser(userId: string, token: string): Promise<{ user: { id: string; email: string; role: 'user' | 'admin' } }> {
    const response = await api._fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/promote`, {
      method: 'POST',
    }, token);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to promote user');
    }

    return response.json();
  },

  async getUsers(token: string): Promise<Array<{ _id: string; email: string; role: string }>> {
    const response = await api._fetchWithAuth(`${API_BASE_URL}/api/users`, {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },

  async getUserFiles(userId: string, token: string): Promise<{ files: FileItem[] } | FileItem[]> {
    const response = await api._fetchWithAuth(`${API_BASE_URL}/api/users/${userId}/files`, {
      method: 'GET',
    }, token);

    if (!response.ok) throw new Error('Failed to fetch user files');
    return response.json();
  },

  async requestAccess(fileId: string, token: string): Promise<void> {
    const response = await api._fetchWithAuth(`${API_BASE_URL}/api/files/${fileId}/request-access`, {
      method: 'POST',
    }, token);

    if (!response.ok) {
      throw new Error('Failed to request access');
    }
  },

  async getAccessRequests(token: string): Promise<Array<{ fileId: string, userId: string, status: 'pending' | 'approved' | 'rejected' }>> {
    const response = await api._fetchWithAuth(`${API_BASE_URL}/api/files/access-requests`, {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw new Error('Failed to get access requests');
    }

    return response.json();
  },

  async approveAccess(requestId: string, permission: 'view' | 'edit', token: string): Promise<void> {
    const response = await api._fetchWithAuth(`${API_BASE_URL}/api/files/access-requests/${requestId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permission }),
    }, token);

    if (!response.ok) {
      throw new Error('Failed to approve access');
    }
  },

  async downloadFile(fileId: string, token: string): Promise<Blob> {
    const response = await api._fetchWithAuth(`${API_BASE_URL}/api/files/download/${fileId}`, {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response.blob();
  },

  async updateFileMetadata(fileId: string, data: { originalName?: string; contentType?: string; ownerId?: string }, token: string): Promise<{ file: FileItem }> {
    const response = await api._fetchWithAuth(`${API_BASE_URL}/api/files/${fileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, token);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update file metadata');
    }

    return response.json();
  },
};
