import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile, UserRole } from '../lib/supabase';
import { UserPlus, Trash2, Edit, ArrowLeft, Save, X } from 'lucide-react';

export default function AdminPanel() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'member' as UserRole,
  });

  useEffect(() => {
    if (profile?.role !== 'admin') {
      window.location.href = '/';
      return;
    }
    loadUsers();
  }, [profile]);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setUsers(data);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: formData.username,
            email: formData.email,
            full_name: formData.full_name,
            phone: formData.phone,
            role: formData.role,
          });

        if (profileError) throw profileError;

        alert('User berhasil dibuat!');
        setShowAddModal(false);
        resetForm();
        loadUsers();
      }
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          is_active: true,
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      alert('User berhasil diupdate!');
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      loadUsers();
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      alert('User berhasil dihapus!');
      loadUsers();
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleToggleActive = async (user: Profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);

      if (error) throw error;
      loadUsers();
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const openEditModal = (user: Profile) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email || '',
      password: '',
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      full_name: '',
      phone: '',
      role: 'member',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      admin: 'bg-red-600 border-red-400 text-white',
      vip: 'bg-purple-600 border-purple-400 text-white',
      premium: 'bg-yellow-600 border-yellow-400 text-white',
      member: 'bg-blue-600 border-blue-400 text-white',
    };
    return colors[role] || colors.member;
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-400 matrix-text mb-2">
              ADMIN PANEL
            </h1>
            <p className="text-green-300 font-mono">User Management System</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all duration-300 border-2 border-green-400 shadow-lg shadow-green-500/50 hover:scale-105 flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Add User
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-bold transition-all duration-300 border-2 border-gray-500 shadow-lg shadow-gray-500/50 hover:scale-105 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>

        <div className="bg-black border-2 border-green-500 rounded-lg shadow-2xl shadow-green-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-900/50 border-b-2 border-green-500">
                <tr>
                  <th className="px-4 py-3 text-left text-green-400 font-mono">Username</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono">Email</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono">Role</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono">Status</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-green-900/30 hover:bg-green-900/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-green-400 font-mono">{user.username}</td>
                    <td className="px-4 py-3 text-green-400 font-mono">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                          user.is_active
                            ? 'bg-green-600 border-green-400 text-white'
                            : 'bg-red-600 border-red-400 text-white'
                        }`}
                      >
                        {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded border-2 border-blue-400 transition-all hover:scale-110"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded border-2 border-red-400 transition-all hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-black border-2 border-green-500 rounded-lg p-6 max-w-md w-full shadow-2xl shadow-green-500/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-green-400">
                {showAddModal ? 'Add New User' : 'Edit User'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleCreateUser : handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-green-400 font-mono text-sm mb-2">Username:</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-gray-900 border-2 border-green-500 rounded px-4 py-2 text-green-400 font-mono focus:outline-none focus:border-green-300"
                  required
                />
              </div>

              {showAddModal && (
                <>
                  <div>
                    <label className="block text-green-400 font-mono text-sm mb-2">Email:</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-gray-900 border-2 border-green-500 rounded px-4 py-2 text-green-400 font-mono focus:outline-none focus:border-green-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-green-400 font-mono text-sm mb-2">Password:</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-gray-900 border-2 border-green-500 rounded px-4 py-2 text-green-400 font-mono focus:outline-none focus:border-green-300"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-green-400 font-mono text-sm mb-2">Full Name:</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-gray-900 border-2 border-green-500 rounded px-4 py-2 text-green-400 font-mono focus:outline-none focus:border-green-300"
                />
              </div>

              <div>
                <label className="block text-green-400 font-mono text-sm mb-2">Phone:</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-900 border-2 border-green-500 rounded px-4 py-2 text-green-400 font-mono focus:outline-none focus:border-green-300"
                />
              </div>

              <div>
                <label className="block text-green-400 font-mono text-sm mb-2">Role:</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full bg-gray-900 border-2 border-green-500 rounded px-4 py-2 text-green-400 font-mono focus:outline-none focus:border-green-300"
                >
                  <option value="member">Member</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all duration-300 border-2 border-green-400 shadow-lg shadow-green-500/50 hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .matrix-text {
          text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00;
        }
      `}</style>
    </div>
  );
}
