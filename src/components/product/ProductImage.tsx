
'use client';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  dataAiHint?: string;
  priority?: boolean; // Added priority prop
}

export function ProductImage({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  dataAiHint,
  priority = false, // Default priority to false
}: ProductImageProps) {
  return (
    <div className={cn('relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        data-ai-hint={dataAiHint}
        priority={priority} // Pass priority to NextImage
      />
    </div>
  );
}
