"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Trash2, Users, AlertCircle, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
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
    fetchUsers();
  }, [router]);

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

  return (
    <div className="min-h-screen bg-[#0A0D14] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#121721] border-r border-white/5 flex flex-col p-6 hidden md:flex">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <span className="text-2xl font-serif font-black tracking-wider text-[#F5F5F1] flex items-center gap-1">
            KNOT<span className="text-[#D4AF37]">.</span>
          </span>
        </Link>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Admin Hub</div>
        <nav className="space-y-2 flex-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-[#D4AF37] font-semibold text-sm">
            <Users className="w-4 h-4" /> Users
          </Link>
        </nav>
        <Link href="/dashboard" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">
          &larr; Back to Dashboard
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10 relative overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#E27D8D]/5 blur-[120px] pointer-events-none" />

        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-white flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-[#E27D8D]" /> Admin Control
            </h1>
            <p className="text-sm text-gray-400 mt-1">Manage platform users and data.</p>
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
                    <th className="p-4 border-b border-white/5">User</th>
                    <th className="p-4 border-b border-white/5">Role</th>
                    <th className="p-4 border-b border-white/5">Location</th>
                    <th className="p-4 border-b border-white/5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/10 text-gray-300'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-gray-400">
                          {user.residenceCity || "Unknown"}, {user.residenceCountry || "Unknown"}
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
                          <button 
                            onClick={() => setDeleteConfirmId(user.id)}
                            disabled={user.role === 'ADMIN'} // Prevent admins from easily deleting other admins
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500 text-sm">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
