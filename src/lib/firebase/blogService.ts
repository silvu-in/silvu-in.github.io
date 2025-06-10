
import { db } from './client';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import type { BlogPost } from '@/types';
import { format } from 'date-fns';

const BLOG_COLLECTION = 'blogPosts';

function mapDocToBlogPost(document: any): BlogPost {
  const data = document.data();
  let publishedDateStr = 'Date not available';
  if (data.publishedDate && data.publishedDate instanceof Timestamp) {
    publishedDateStr = format(data.publishedDate.toDate(), 'MMMM d, yyyy');
  } else if (typeof data.publishedDate === 'string') {
    try {
      publishedDateStr = format(new Date(data.publishedDate), 'MMMM d, yyyy');
    } catch (e) {
      // Keep default if parsing fails
    }
  }

  return {
    id: document.id,
    slug: data.slug || '',
    title: data.title || 'Untitled Post',
    content: data.content || '',
    excerpt: data.excerpt || '',
    author: data.author || 'Unknown Author',
    publishedDate: publishedDateStr,
    imageUrl: data.imageUrl,
    dataAiHint: data.dataAiHint,
  };
}

export async function getBlogPosts(count?: number): Promise<BlogPost[]> {
  try {
    const postsRef = collection(db, BLOG_COLLECTION);
    let q = query(postsRef, orderBy('publishedDate', 'desc'));
    if (count) {
      q = query(postsRef, orderBy('publishedDate', 'desc'), limit(count));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDocToBlogPost);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const postDocRef = doc(db, BLOG_COLLECTION, slug); // Assuming slug is the document ID
    const docSnap = await getDoc(postDocRef);
    if (docSnap.exists()) {
      return mapDocToBlogPost(docSnap);
    }
    // Fallback query if slug is not the ID (less efficient)
    const postsRef = collection(db, BLOG_COLLECTION);
    const q = query(postsRef, where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return mapDocToBlogPost(querySnapshot.docs[0]);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching blog post by slug ${slug}:`, error);
    return null;
  }
}

export async function getAllBlogPostSlugs(): Promise<{ slug: string }[]> {
  try {
    const postsRef = collection(db, BLOG_COLLECTION);
    const q = query(postsRef, orderBy('publishedDate', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(document => ({ slug: document.data().slug || '' }));
  } catch (error) {
    console.error("Error fetching all blog post slugs:", error);
    return [];
  }
}

export async function seedTestBlogPost(): Promise<string> {
  const testPost = {
    slug: 'my-seeded-test-post', // This will also be the document ID
    title: 'My Seeded Test Post via Code!',
    content: '<p>This blog post was programmatically added to Firestore using a seed function.</p><p>This is useful for setting up initial data or for testing purposes.</p><ul><li>Item 1</li><li>Item 2</li></ul><p>This ensures your blog system is fetching and displaying data correctly from Firebase.</p>',
    excerpt: 'A demonstration of seeding blog content into Firebase Firestore from the application code for testing purposes.',
    author: 'Dev Seed Script',
    publishedDate: Timestamp.fromDate(new Date(2024, 4, 15)), // Month is 0-indexed, so 4 is May
    imageUrl: 'https://placehold.co/800x450.png',
    dataAiHint: 'code database',
  };

  try {
    const postDocRef = doc(db, BLOG_COLLECTION, testPost.slug);
    const docSnap = await getDoc(postDocRef);

    if (docSnap.exists()) {
      console.log(`Blog post with slug '${testPost.slug}' already exists. No action taken.`);
      return `Blog post with slug '${testPost.slug}' already exists.`;
    } else {
      await setDoc(postDocRef, testPost);
      console.log(`Test blog post '${testPost.title}' seeded successfully.`);
      return `Test blog post '${testPost.title}' seeded successfully. Refresh the page to see it.`;
    }
  } catch (error) {
    console.error("Error seeding test blog post:", error);
    // Ensure the error is serializable for the server action
    if (error instanceof Error) {
        throw new Error(`Failed to seed test blog post: ${error.message}`);
    }
    throw new Error('Failed to seed test blog post due to an unknown error.');
  }
}
