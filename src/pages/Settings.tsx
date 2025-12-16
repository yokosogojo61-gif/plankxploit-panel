import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Lock,
  Camera,
  Save,
  UserPlus,
  Trash2,
  Edit,
  Crown,
  Diamond,
  Eye,
  EyeOff,
  Loader2,
  Users,
  Bell,
  Send,
} from 'lucide-react';
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
  avatar_url: string | null;
  phone: string | null;
  last_active: string | null;
  is_online: boolean;
}

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'broadcast'>('profile');
  
  // Profile form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // User management
  const [users, setUsers] = useState<Profile[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    username: '',
    role: 'member' as 'member' | 'premium' | 'vip',
  });
  
  // Broadcast
  const [broadcastMessage, setBroadcastMessage] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (profile && canManageUsers()) {
      loadUsers();
    }
  }, [profile]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error || !data) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data as Profile);
  };

  const loadUsers = async () => {
    if (!profile) return;
    
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    
    // Premium can only see members
    if (profile.role === 'premium' && !profile.is_admin) {
      query = query.eq('role', 'member');
    }
    // VIP can see members and premium
    else if (profile.role === 'vip' && !profile.is_admin) {
      query = query.in('role', ['member', 'premium']);
    }
    // Admin sees all
    
    const { data, error } = await query;
    if (data) setUsers(data as Profile[]);
  };

  const canManageUsers = () => {
    if (!profile) return false;
    return profile.is_admin || profile.role === 'premium' || profile.role === 'vip';
  };

  const canCreateRole = (role: string) => {
    if (!profile) return false;
    if (profile.is_admin) return true;
    if (profile.role === 'vip') return role === 'member' || role === 'premium';
    if (profile.role === 'premium') return role === 'member';
    return false;
  };

  const canDeleteUser = (targetRole: string) => {
    if (!profile) return false;
    if (profile.is_admin) return true;
    if (profile.role === 'vip') return targetRole === 'member' || targetRole === 'premium';
    if (profile.role === 'premium') return targetRole === 'member';
    return false;
  };

  const canBroadcast = () => {
    if (!profile) return false;
    return profile.is_admin || profile.role === 'vip';
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Password tidak cocok!', variant: 'destructive' });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password minimal 6 karakter!', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Berhasil!', description: 'Password berhasil diubah' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile || !profile) return;

    setLoading(true);
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${profile.user_id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('yokoso')
      .upload(`avatars/${fileName}`, avatarFile);

    if (uploadError) {
      setLoading(false);
      toast({ title: 'Error', description: uploadError.message, variant: 'destructive' });
      return;
    }

    const { data: urlData } = supabase.storage.from('yokoso').getPublicUrl(`avatars/${fileName}`);
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('user_id', profile.user_id);

    setLoading(false);

    if (updateError) {
      toast({ title: 'Error', description: updateError.message, variant: 'destructive' });
    } else {
      toast({ title: 'Berhasil!', description: 'Avatar berhasil diubah' });
      setAvatarFile(null);
      checkUser();
    }
  };

  const handleCreateUser = async () => {
    if (!canCreateRole(newUserForm.role)) {
      toast({ title: 'Error', description: 'Anda tidak memiliki izin untuk membuat role ini!', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newUserForm.email,
      password: newUserForm.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          username: newUserForm.username,
          role: newUserForm.role,
        },
      },
    });

    if (authError) {
      setLoading(false);
      toast({ title: 'Error', description: authError.message, variant: 'destructive' });
      return;
    }

    setLoading(false);
    toast({ title: 'Berhasil!', description: 'User berhasil dibuat' });
    setShowCreateModal(false);
    setNewUserForm({ email: '', password: '', username: '', role: 'member' });
    loadUsers();
  };

  const handleDeleteUser = async (userId: string, userRole: string) => {
    if (!canDeleteUser(userRole)) {
      toast({ title: 'Error', description: 'Anda tidak memiliki izin untuk menghapus user ini!', variant: 'destructive' });
      return;
    }

    if (!confirm('Yakin ingin menghapus/ban user ini?')) return;

    setLoading(true);
    const { error } = await supabase.from('profiles').delete().eq('user_id', userId);
    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Berhasil!', description: 'User berhasil dihapus/banned' });
      loadUsers();
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim() || !profile) return;

    setLoading(true);
    const { error } = await supabase.from('broadcast_notifications').insert({
      sender_id: profile.user_id,
      message: broadcastMessage,
    });
    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Berhasil!', description: 'Broadcast terkirim ke semua user' });
      setBroadcastMessage('');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'vip':
        return <span className="flex items-center gap-1 text-yellow-400"><Crown className="h-3 w-3" />VIP</span>;
      case 'premium':
        return <span className="flex items-center gap-1 text-purple-400"><Diamond className="h-3 w-3" />PREMIUM</span>;
      default:
        return <span className="flex items-center gap-1 text-muted-foreground"><User className="h-3 w-3" />MEMBER</span>;
    }
  };

  return (
    <div className="relative min-h-screen">
      <VideoBackground />

      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <MatrixText text="Settings" className="text-xl" glitch={false} />
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            onClick={() => setActiveTab('profile')}
            className="whitespace-nowrap"
          >
            <User className="h-4 w-4 mr-2" />
            Profil
          </Button>
          {canManageUsers() && (
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
              className="whitespace-nowrap"
            >
              <Users className="h-4 w-4 mr-2" />
              Kelola User
            </Button>
          )}
          {canBroadcast() && (
            <Button
              variant={activeTab === 'broadcast' ? 'default' : 'outline'}
              onClick={() => setActiveTab('broadcast')}
              className="whitespace-nowrap"
            >
              <Bell className="h-4 w-4 mr-2" />
              Broadcast
            </Button>
          )}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Avatar Section */}
            <div className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-display text-primary mb-4">Foto Profil</h3>
              <div className="flex items-center gap-4">
                <img
                  src={profile?.avatar_url || '/placeholder.svg'}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full border-2 border-primary object-cover"
                />
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="bg-input/50"
                  />
                  <Button
                    onClick={handleUploadAvatar}
                    disabled={!avatarFile || loading}
                    size="sm"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                    Upload
                  </Button>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-display text-primary mb-4">Ubah Password</h3>
              <div className="space-y-4 max-w-md">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password Baru"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 bg-input/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Konfirmasi Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-input/50"
                />
                <Button onClick={handleUpdatePassword} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Simpan Password
                </Button>
              </div>
            </div>

            {/* Role Info */}
            <div className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-display text-primary mb-4">Info Akun</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Username: <span className="text-foreground">{profile?.username}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Role: {profile && getRoleBadge(profile.role)}
                </p>
                {profile?.is_admin && (
                  <p className="text-sm text-red-400">Admin Status: Active</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && canManageUsers() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-display text-primary">Kelola User</h3>
              <Button onClick={() => setShowCreateModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Buat User
              </Button>
            </div>

            <div className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-muted-foreground">Username</th>
                      <th className="px-4 py-3 text-left text-xs text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-left text-xs text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-xs text-muted-foreground">Terakhir Aktif</th>
                      <th className="px-4 py-3 text-left text-xs text-muted-foreground">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-border/50">
                        <td className="px-4 py-3 text-sm">{user.username}</td>
                        <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${user.is_online ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                            {user.is_online ? 'Online' : 'Offline'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {user.last_active ? new Date(user.last_active).toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {canDeleteUser(user.role) && user.user_id !== profile?.user_id && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(user.user_id, user.role)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Broadcast Tab */}
        {activeTab === 'broadcast' && canBroadcast() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-display text-primary mb-4">Kirim Broadcast</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Kirim pesan notifikasi ke semua user yang sedang aktif
              </p>
              <div className="space-y-4">
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Tulis pesan broadcast..."
                  className="w-full h-32 bg-input/50 border border-border rounded-lg p-3 resize-none focus:outline-none focus:border-primary"
                />
                <Button onClick={handleBroadcast} disabled={loading || !broadcastMessage.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Kirim Broadcast
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cyber-border rounded-lg bg-card p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-display text-primary mb-4">Buat User Baru</h3>
            <div className="space-y-4">
              <Input
                placeholder="Email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                className="bg-input/50"
              />
              <Input
                placeholder="Username"
                value={newUserForm.username}
                onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                className="bg-input/50"
              />
              <Input
                type="password"
                placeholder="Password"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                className="bg-input/50"
              />
              <select
                value={newUserForm.role}
                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                className="w-full bg-input/50 border border-border rounded-lg px-3 py-2"
              >
                {canCreateRole('member') && <option value="member">Member</option>}
                {canCreateRole('premium') && <option value="premium">Premium</option>}
                {canCreateRole('vip') && <option value="vip">VIP</option>}
              </select>
              <div className="flex gap-2">
                <Button onClick={handleCreateUser} disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buat'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Batal
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Settings;
