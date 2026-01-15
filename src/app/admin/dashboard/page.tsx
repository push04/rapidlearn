'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Users, Shield, LogOut } from 'lucide-react';

export default function AdminDashboard() {
    // Simple state-based auth view for MVP (real protection is in API)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [msg, setMsg] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
            setIsLoggedIn(true);
            setMsg('');
        } else {
            setMsg('Invalid Credentials');
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/invite', {
            method: 'POST',
            body: JSON.stringify({ email: inviteEmail }),
        });

        if (res.ok) {
            setMsg(`Invited ${inviteEmail}`);
            setInviteEmail('');
        } else {
            setMsg('Failed to invite user');
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-8 bg-[#0a0a0a] border-gray-800">
                    <div className="flex justify-center mb-6">
                        <Shield className="w-12 h-12 text-[#00f2ff]" />
                    </div>
                    <h1 className="text-2xl font-bold text-center text-white mb-6">RapidLearn Admin</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-[#1a1a1a] border-gray-700 text-white"
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-[#1a1a1a] border-gray-700 text-white"
                        />
                        <Button type="submit" className="w-full bg-[#00f2ff] text-black hover:bg-[#00c2cc]">
                            Login
                        </Button>
                        {msg && <p className="text-red-500 text-center">{msg}</p>}
                    </form>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <header className="flex justify-between items-center mb-12 border-b border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-[#00f2ff]" />
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                </div>
                <Button variant="ghost" onClick={() => setIsLoggedIn(false)} className="text-gray-400 hover:text-white">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Invite System */}
                <Card className="p-6 bg-[#0a0a0a] border-gray-800">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        Invite User
                    </h2>
                    <p className="text-gray-400 mb-4 text-sm">
                        Grant access to the platform. Users must sign up with this email.
                    </p>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <Input
                            type="email"
                            placeholder="user@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="bg-[#1a1a1a] border-gray-700 text-white"
                        />
                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                            Send Invite
                        </Button>
                    </form>
                    {msg && <p className="mt-4 text-green-400 text-sm">{msg}</p>}
                </Card>

                {/* Placeholder Stats */}
                <Card className="p-6 bg-[#0a0a0a] border-gray-800 opacity-50">
                    <h2 className="text-xl font-semibold mb-2">Total Users</h2>
                    <p className="text-4xl font-mono text-[#00f2ff]">--</p>
                </Card>

                <Card className="p-6 bg-[#0a0a0a] border-gray-800 opacity-50">
                    <h2 className="text-xl font-semibold mb-2">Documents Processed</h2>
                    <p className="text-4xl font-mono text-purple-500">--</p>
                </Card>
            </div>
        </div>
    );
}
