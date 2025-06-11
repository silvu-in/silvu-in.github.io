
'use client';

import dynamic from 'next/dynamic';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const FundingForm = dynamic(() =>
  import('@/components/funding/FundingForm').then(mod => mod.FundingForm),
  {
    ssr: false,
    loading: () => (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <Skeleton className="h-7 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-1/2 mt-1 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div>
            <Skeleton className="h-4 w-1/4 mb-2 rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </CardContent>
        <CardFooter className="pt-6">
          <Skeleton className="h-3 w-full rounded-md" />
        </CardFooter>
      </Card>
    )
  }
);

export function FundingFormLoader() {
  return <FundingForm />;
}
