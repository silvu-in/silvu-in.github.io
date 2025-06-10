
'use client';

import Link from 'next/link';
import { Menu, User } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { CartIcon } from '@/components/cart/CartIcon';
import { UserNav } from '@/components/auth/UserNav';
import { useAuth } from '@/context/AuthContext';
import { ProductSearch } from '@/components/product/ProductSearch';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className={cn('w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between')}>

        {/* Left Group: Mobile Menu Trigger (mobile) + Logo */}
        <div className="flex items-center">
          <div className="md:hidden mr-2"> {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-4 pt-8">
                 <div className="mb-6">
                  <Link href="/" className="flex items-center space-x-2">
                    <Logo className="h-7 w-auto" />
                    <span className="font-semibold text-lg">Silvu</span>
                  </Link>
                </div>
                <nav className="flex flex-col space-y-1">
                  <SheetClose asChild>
                    <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground">Home</Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/products" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground">Products</Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/blog" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground">Blog</Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/funding" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground">
                      Fund Now
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/account" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground">
                      Account
                    </Link>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-auto" />
            <span className="font-semibold text-lg hidden sm:inline-block">Silvu</span>
          </Link>
        </div>

        {/* Centered Nav (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1">
          <Button variant="link" asChild className="text-sm font-medium text-foreground/70 hover:text-primary px-3 py-2">
            <Link href="/">Home</Link>
          </Button>
          <Button variant="link" asChild className="text-sm font-medium text-foreground/70 hover:text-primary px-3 py-2">
            <Link href="/products">Products</Link>
          </Button>
          <Button variant="link" asChild className="text-sm font-medium text-foreground/70 hover:text-primary px-3 py-2">
            <Link href="/blog">Blog</Link>
          </Button>
          <Button variant="link" asChild className="text-sm font-medium text-foreground/70 hover:text-primary px-3 py-2">
            <Link href="/funding">
              Fund Now
            </Link>
          </Button>
        </nav>

        {/* Right Group: Search (conditionally hidden on mobile) + Cart + User */}
        <div className="flex items-center space-x-2">
          <div className="hidden sm:block"> {/* ProductSearch hidden on xs screens */}
            <ProductSearch />
          </div>
          <CartIcon />
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <UserNav />
          ) : (
            <Button asChild variant="ghost" size="icon" className="rounded-full">
              <Link href="/account"> {/* Changed from /login to /account */}
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Link>
            </Button>
          )}
        </div>

      </div>
    </header>
  );
}
