
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedProductsSkeleton = () => (
  <section className="py-12">
    <div className="flex justify-between items-center mb-8">
      <Skeleton className="h-8 w-1/3 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-6 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
    </div>
  </section>
);

const FeaturedProducts = dynamic(() =>
  import('@/components/product/FeaturedProducts').then(mod => mod.FeaturedProducts),
  { loading: () => <FeaturedProductsSkeleton /> }
);

export default function HomePage() {
  return (
    <>
      <section className="relative bg-muted/40 py-16 sm:py-24 lg:py-32 rounded-xl overflow-hidden mb-12">
        <div className="absolute inset-0">
            <Image 
                src="https://ik.imagekit.io/Silvu1704/lilian-velet-oHY0NfxZsJc-unsplash.jpg?updatedAt=1749640340773"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                alt="Sky background for hero section"
                fill
                className="object-cover opacity-20"
                data-ai-hint="sky background"
                priority
            />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
        <div className={cn('w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center')}>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl font-headline">
            SILVU: Innovating <span className="text-primary">Drone</span> Technology
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-foreground/80 sm:text-xl">
            Discover the latest in drone technology, parts, and accessories. Elevate your flight experience with Silvu.
          </p>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link href="/products">Shop All Products</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <PageContainer>
        <FeaturedProducts />

        <section className="py-12 mt-8 bg-secondary/50 rounded-xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4 font-headline">Pioneering Aerospace Innovation in India</h2>
              <p className="text-lg text-muted-foreground mb-6">
                At Silvu, we're driven by deep self-learning and engineering creativity to revolutionize aerospace technology. Our goal is to make cutting-edge drone systems accessible, aiming for 90% less cost in India.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  Developing proprietary low-latency transmitter/receiver protocols.
                </li>
                <li className="flex items-center">
                   <svg className="w-5 h-5 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  Focused on making aerospace technology affordable and homegrown in India.
                </li>
                <li className="flex items-center">
                   <svg className="w-5 h-5 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  AI-powered recommendations to find complementary parts.
                </li>
              </ul>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
                <Image 
                    src="https://ik.imagekit.io/Silvu1704/Black%20and%20White%20Abstract%20Tech%20General%20Linkedin%20Banner.png?updatedAt=1749641819786" 
                    alt="Abstract technology background" 
                    width={1200} 
                    height={600} 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    className="object-cover w-full h-full"
                    data-ai-hint="abstract tech"
                />
            </div>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
