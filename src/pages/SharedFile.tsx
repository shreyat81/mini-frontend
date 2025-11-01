import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SharedFile() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, token: authToken } = useAuth();
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchPublicFile(token);
  }, [token]);

  const fetchPublicFile = async (t: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api/files/public/${t}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setFile(data);
    } catch (error) {
      toast.error('File not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!authToken) {
      toast.error('Please log in to request access');
      navigate('/login');
      return;
    }

    try {
      await api.requestAccess(file._id, authToken);
      toast.success('Access request submitted');
    } catch (error) {
      toast.error('Failed to request access');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!file) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold">{file.originalName}</h2>
          <p className="text-muted-foreground">Owner: {file.owner?.email ?? '—'}</p>
          <p className="text-sm">Size: {file.size}</p>
          <div className="mt-4">
            <Button onClick={handleRequestAccess}>Request Access</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
