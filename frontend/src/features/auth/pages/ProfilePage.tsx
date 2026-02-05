import { Hand } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/hooks';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in (double check in render)
  if (!loading && !user) {
    navigate('/signin');
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-none shadow-none bg-transparent">
          <CardHeader className="flex flex-col items-center space-y-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Welcome Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 ring-8 ring-background shadow-xl">
            <Hand className="h-16 w-16 text-primary animate-wave origin-bottom-right" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
            Welcome, {user.first_name || user.username}!
          </h1>
          <p className="text-xl text-muted-foreground max-w-md">
            You are currently logged in.
          </p>
        </div>
      </div>
    </div>
  );
}
