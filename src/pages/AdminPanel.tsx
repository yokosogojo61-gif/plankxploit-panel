import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Trash2, Edit, Save, X, Crown, Diamond, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VideoBackground from '@/components/VideoBackground';
import MatrixText from '@/components/MatrixText';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  role: 'member' | 'premium' | 'vip';
  is_admin: boolean;
  phone: string | null;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'member' as const });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }

    const { data } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single();
    if (!data?.is_admin) { navigate('/dashboard'); return; }
    setProfile(data as Profile);
    loadUsers();
  };

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data as Profile[]);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: formData.email, password: formData.password,
      options: { data: { username: formData.username, role: formData.role } }
    });
    setLoading(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Berhasil!', description: 'User dibuat' });
    setShowAddModal(false);
    setFormData({ username: '', email: '', password: '', role: 'member' });
    loadUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Hapus user ini?')) return;
    const { error } = await supabase.from('profiles').delete().eq('user_id', userId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Berhasil!' }); loadUsers(); }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('user_id', userId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Role diupdate!' }); loadUsers(); }
  };

  return (
    <div className="relative min-h-screen">
      <VideoBackground />
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <MatrixText text="Admin Panel" className="text-xl" glitch={false} />
          <Button variant="ghost" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-4 w-4 mr-2" />Kembali</Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-display text-primary">User Management</h2>
          <Button onClick={() => setShowAddModal(true)}><UserPlus className="h-4 w-4 mr-2" />Add User</Button>
        </div>
        <div className="cyber-border rounded-lg bg-card/80 overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50"><tr>
              <th className="px-4 py-3 text-left text-xs">Username</th>
              <th className="px-4 py-3 text-left text-xs">Role</th>
              <th className="px-4 py-3 text-left text-xs">Actions</th>
            </tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-border/50">
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3">
                    <select value={user.role} onChange={(e) => handleUpdateRole(user.user_id, e.target.value)} className="bg-input/50 border border-border rounded px-2 py-1 text-sm">
                      <option value="member">Member</option>
                      <option value="premium">Premium</option>
                      <option value="vip">VIP</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {!user.is_admin && <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.user_id)}><Trash2 className="h-3 w-3" /></Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="cyber-border rounded-lg bg-card p-6 max-w-md w-full">
            <h3 className="text-lg font-display text-primary mb-4">Add New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <Input placeholder="Username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
              <Input placeholder="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              <Input placeholder="Password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as any})} className="w-full bg-input/50 border border-border rounded-lg px-3 py-2">
                <option value="member">Member</option><option value="premium">Premium</option><option value="vip">VIP</option>
              </select>
              <div className="flex gap-2"><Button type="submit" disabled={loading} className="flex-1">{loading ? 'Creating...' : 'Create'}</Button><Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button></div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
