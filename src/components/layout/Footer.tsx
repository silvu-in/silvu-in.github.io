
import { cn } from '@/lib/utils';
import Link from 'next/link'; // Import Link

export function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t">
      <div className={cn('w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 md:h-24')}>
        <div className="text-center md:text-left">
          <p className="text-sm leading-loose text-muted-foreground">
            &copy; {new Date().getFullYear()} Silvu. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            SILVU: Silicon Innovation for Limitless Vision and Utility
          </p>
        </div>
        <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/contact" className="hover:text-primary hover:underline">
            Contact Us
          </Link>
          <span className="hidden md:inline">|</span> {/* Separator for larger screens */}
          <span>The Dream Tech</span>
        </nav>
      </div>
    </footer>
  );
}
