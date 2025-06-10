
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { getBlogPosts } from '@/lib/firebase/blogService';
import type { BlogPost } from '@/types';
import { SeedPostButton } from '@/components/blog/SeedPostButton';

export const revalidate = 60; // Revalidate data every 60 seconds

export default async function BlogPage() {
  const posts: BlogPost[] = await getBlogPosts();

  return (
    <PageContainer>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold tracking-tight font-headline">
            Silvu Blog
          </h1>
          <p className="mt-3 text-xl text-muted-foreground">
            News, insights, and updates from the Silvu team.
          </p>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="flex-shrink-0">
            <SeedPostButton />
          </div>
        )}
      </div>

      {posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug} legacyBehavior>
              <a className="block group">
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{post.excerpt || 'Read more...'}</p>
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      ) : (
         <div className="text-center py-12">
            <h2 className="text-2xl font-semibold">No Posts Yet!</h2>
            <p className="text-muted-foreground mt-2">
              Our blog is under construction or no posts have been published.
              {process.env.NODE_ENV === 'development' 
                ? " Try clicking the 'Seed Test Blog Post' button to add a sample post." 
                : " Check back later for exciting updates!"}
            </p>
        </div>
      )}
    </PageContainer>
  );
}
