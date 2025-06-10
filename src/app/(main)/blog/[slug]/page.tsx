
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBlogPostBySlug, getAllBlogPostSlugs } from '@/lib/firebase/blogService';
import type { BlogPost } from '@/types';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface BlogPostPageProps {
  params: { slug: string };
}

export const revalidate = 60; // Revalidate data every 60 seconds

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) {
    return {
      title: 'Post Not Found - Silvu',
    };
  }
  return {
    title: `${post.title} - Silvu Blog - Silvu`,
    description: post.excerpt || post.content.substring(0, 150), // Use excerpt or beginning of content
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post: BlogPost | null = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound(); // This will render the nearest not-found.tsx or a default Next.js 404 page
  }

  // A simple way to render HTML content (ensure it's sanitized if coming from untrusted sources)
  const createMarkup = () => {
    return { __html: post.content };
  };

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/blog" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
          <h1 className="text-4xl font-bold tracking-tight font-headline mb-3">{post.title}</h1>
          <p className="text-sm text-muted-foreground">
            By {post.author} on {post.publishedDate}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <article className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={createMarkup()} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

export async function generateStaticParams() {
  const slugs = await getAllBlogPostSlugs();
  return slugs.map(item => ({ slug: item.slug }));
}
