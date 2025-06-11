
import { PageContainer } from '@/components/layout/PageContainer';
import { getCampaignDetails, getRecentFunders } from '@/lib/firebase/fundingService';
import type { FundingCampaign, Funder } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { FundingFormLoader } from '@/components/funding/FundingFormLoader'; // Import the new loader

export const revalidate = 60; // Revalidate data every 60 seconds

const CAMPAIGN_ID = 'mainCampaign';

const FundingProgress = dynamic(() =>
  import('@/components/funding/FundingProgress').then(mod => mod.FundingProgress),
  { loading: () => <Skeleton className="h-24 w-full rounded-lg p-6 mb-2" /> }
);

// The problematic dynamic import for FundingForm is removed from here

const FundersListSkeleton = () => (
  <Card className="mt-8 shadow-md">
    <CardHeader>
      <Skeleton className="h-6 w-1/2 rounded-md" />
    </CardHeader>
    <CardContent className="pt-6">
      <div className="h-[300px] space-y-4 pr-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3 rounded-lg border">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const FundersList = dynamic(() =>
  import('@/components/funding/FundersList').then(mod => mod.FundersList),
  { loading: () => <FundersListSkeleton /> }
);


export default async function FundingPage() {
  const campaign: FundingCampaign | null = await getCampaignDetails(CAMPAIGN_ID);
  const funders: Funder[] = await getRecentFunders(15);

  return (
    <PageContainer>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-headline">
          {campaign?.campaignTitle || "Support Silvu's Innovation"}
        </h1>
        <p className="mt-3 text-xl text-muted-foreground max-w-2xl mx-auto">
          {campaign?.campaignDescription || "Help us revolutionize aerospace technology in India. Your contribution fuels our mission to develop cutting-edge drone systems and make them accessible."}
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-3 space-y-8">
          <Card className="overflow-hidden shadow-xl">
            <div className="aspect-video relative w-full bg-muted">
              <Image
                src="https://placehold.co/800x450.png"
                alt={campaign?.campaignTitle || "Innovation in drone technology"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 800px"
                className="object-cover"
                data-ai-hint="technology investment funding"
                priority
              />
            </div>
            <CardContent className="p-6">
                 <FundingProgress campaign={campaign} />
            </CardContent>
          </Card>

          {funders.length > 0 && (
            <div className="block md:hidden">
                <FundersList funders={funders} currency={campaign?.currency || 'INR'} />
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <FundingFormLoader /> {/* Use the new loader component */}
          {funders.length > 0 && (
             <div className="hidden md:block mt-8">
                <FundersList funders={funders} currency={campaign?.currency || 'INR'} />
            </div>
          )}
           {funders.length === 0 && (
            <div className="hidden md:block">
                 <FundersList funders={[]} currency={campaign?.currency || 'INR'} />
            </div>
           )}
        </div>
      </div>
       {funders.length === 0 && (
            <div className="block md:hidden mt-8">
                 <FundersList funders={[]} currency={campaign?.currency || 'INR'} />
            </div>
        )}

    </PageContainer>
  );
}
