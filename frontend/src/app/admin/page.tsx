"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Trash2, Users, AlertCircle, Loader2, LogOut, Lock, Unlock, Plus, X, Menu } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Create User State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchUsers = async () => {
      const token = localStorage.getItem('knot_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://knot-backend-core.onrender.com';
          
        const res = await fetch(`${API_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.status === 403 || res.status === 401) {
          router.push('/dashboard');
          return;
        }

        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load users.");
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchUsers();
  }, [router]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newFirstName || !newLastName) {
      setCreateError("All fields are required.");
      return;
    }
    
    setIsCreating(true);
    setCreateError("");
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://knot-backend-core.onrender.com';
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          firstName: newFirstName,
          lastName: newLastName
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to create user.");
      }
      
      // Successfully created, close modal and refresh list
      setIsCreateModalOpen(false);
      setNewEmail("");
      setNewPassword("");
      setNewFirstName("");
      setNewLastName("");
      fetchUsers();
      
    } catch (err: any) {
      setCreateError(err.message || "An error occurred while creating the user.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('knot_token');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://knot-backend-core.onrender.com';
        
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert("Failed to delete user.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const toggleSuspend = async (id: string, currentStatus: boolean) => {
    const token = localStorage.getItem('knot_token');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://knot-backend-core.onrender.com';
      const res = await fetch(`${API_URL}/admin/users/${id}/suspend`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isSuspended: !currentStatus })
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(u => u.id === id ? { ...u, isSuspended: data.isSuspended } : u));
      } else {
        alert("Failed to update suspension status.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update suspension status.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] flex">
      {/* Sidebar Backdrop for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#121721] border-r border-white/5 flex flex-col p-6 transition-transform duration-300 md:static md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-serif font-black tracking-wider text-[#F5F5F1] flex items-center gap-1">
              KNOT<span className="text-[#D4AF37]">.</span>
            </span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-gray-400 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Admin Hub</div>
        <nav className="space-y-2 flex-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-[#D4AF37] font-semibold text-sm" onClick={() => setIsSidebarOpen(false)}>
            <Users className="w-4 h-4" /> Users
          </Link>
        </nav>
        <div className="mt-auto space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-xs font-semibold text-gray-400 hover:text-white transition-colors">
            &larr; Back to Dashboard
          </Link>
          <button onClick={() => { localStorage.removeItem('knot_token'); router.push('/login'); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors font-semibold text-sm w-full text-left">
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10 relative overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#E27D8D]/5 blur-[120px] pointer-events-none" />

        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-400 hover:text-white md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-white flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-[#E27D8D]" /> Admin Control
              </h1>
              <p className="text-sm text-gray-400 mt-1">Manage platform users and data.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create User
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[#D4AF37]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        ) : (
          <div className="glass-card rounded-[24px] border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    <th className="p-4 border-b border-white/5">Name</th>
                    <th className="p-4 border-b border-white/5">Subscription</th>
                    <th className="p-4 border-b border-white/5">Location</th>
                    <th className="p-4 border-b border-white/5">Marriage Status</th>
                    <th className="p-4 border-b border-white/5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          {user.firstName} {user.lastName}
                          {user.role === 'ADMIN' && <span className="text-[9px] font-black uppercase bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded">Admin</span>}
                          {user.isSuspended && <span className="text-[9px] font-black uppercase bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Suspended</span>}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="p-4">
                        {user.isPremium ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">Yes <span className="text-gray-500 font-normal">($49/mo)</span></span>
                        ) : (
                          <span className="text-xs text-gray-500">No</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-gray-400">
                          {user.residenceCity || "Unknown"}, {user.residenceCountry || "Unknown"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-gray-400">
                          {user.maritalStatus || "Not Specified"}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {deleteConfirmId === user.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-red-400 font-bold">Confirm?</span>
                            <button onClick={() => handleDelete(user.id)} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs font-bold transition-colors">
                              Yes
                            </button>
                            <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors">
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => toggleSuspend(user.id, user.isSuspended)}
                              disabled={user.role === 'ADMIN'}
                              className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${user.isSuspended ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400'}`}
                              title={user.isSuspended ? "Unsuspend User" : "Suspend User"}
                            >
                              {user.isSuspended ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => setDeleteConfirmId(user.id)}
                              disabled={user.role === 'ADMIN'}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121721] rounded-[24px] border border-white/10 shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-serif font-black text-white">Create New User</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                  {createError}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">First Name</label>
                  <input 
                    type="text" 
                    value={newFirstName}
                    onChange={e => setNewFirstName(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Last Name</label>
                  <input 
                    type="text" 
                    value={newLastName}
                    onChange={e => setNewLastName(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#D4AF37] text-black hover:bg-[#F2CD5C] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
