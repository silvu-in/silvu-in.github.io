
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function UserNav() {
  const { user } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    if (name.length > 1) return name.substring(0, 2).toUpperCase();
    return name[0]?.toUpperCase() || 'U';
  };

  if (!user) return null;

  return (
    <Link href="/account" aria-label="Account">
      <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.photoURL || ''} alt={user.displayName || (user.email ? `Profile picture for ${user.email}` : 'User Avatar')} />
          <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
        </Avatar>
      </Button>
    </Link>
  );
}
