
import { AuthForm } from '@/components/auth/AuthForm';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <PageContainer className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="w-full max-w-md mb-6">
        <Button asChild variant="ghost" className="text-sm text-muted-foreground hover:text-primary">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      <AuthForm mode="login" />
    </PageContainer>
  );
}
