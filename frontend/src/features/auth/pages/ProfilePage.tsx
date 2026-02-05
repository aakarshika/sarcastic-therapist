import { Hand, User, Mail, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/hooks';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in (double check in render)
  if (!loading && !user) {
    navigate('/signin');
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-white/10 bg-background/40 backdrop-blur-xl">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="w-full max-w-4xl mb-8 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="md:col-span-2 space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
          <Card className="border-white/10 bg-background/40 backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20" />
            <CardHeader className="relative pb-0">
              <div className="absolute -top-16 left-6 flex h-24 w-24 items-center justify-center rounded-full bg-background ring-4 ring-background shadow-lg">
                <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center text-4xl">
                  {user.first_name?.[0] || user.username?.[0] || 'U'}
                </div>
              </div>
              <div className="pt-10 pl-2">
                <CardTitle className="text-2xl font-bold">
                  {user.first_name} {user.last_name}
                </CardTitle>
                <CardDescription className="text-base flex items-center gap-2 mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  Active Member
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 p-3 rounded-lg bg-background/50 border border-white/5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3" /> Username
                  </label>
                  <div className="font-medium text-lg">{user.username}</div>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-background/50 border border-white/5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </label>
                  <div className="font-medium text-lg">{user.email}</div>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-background/50 border border-white/5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </label>
                  <div className="font-medium text-lg">{user.phone_number || 'Not provided'}</div>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-background/50 border border-white/5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Joined
                  </label>
                  <div className="font-medium text-lg">February 2026</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <Card className="border-white/10 bg-background/40 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start" onClick={() => navigate('/chat')}>
                Go to Chat
              </Button>
              <Button variant="destructive" className="justify-start mt-4" onClick={logout}>
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
