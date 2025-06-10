import { AuthForm } from '@/components/auth/AuthForm';
import { PageContainer } from '@/components/layout/PageContainer';

export default function SignupPage() {
  return (
    <PageContainer className="flex min-h-screen flex-col items-center justify-center py-12">
      <AuthForm mode="signup" />
    </PageContainer>
  );
}
