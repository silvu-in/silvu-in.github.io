
import { PageContainer } from '@/components/layout/PageContainer';
import { FundingProgress } from '@/components/funding/FundingProgress';
import { FundingForm } from '@/components/funding/FundingForm';
import { FundersList } from '@/components/funding/FundersList';
import { getCampaignDetails, getRecentFunders } from '@/lib/firebase/fundingService';
import type { FundingCampaign, Funder } from '@/types';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export const revalidate = 60; // Revalidate data every 60 seconds

// You should create a document with ID 'mainCampaign' in your 'fundingCampaigns' collection in Firestore.
const CAMPAIGN_ID = 'mainCampaign'; 

export default async function FundingPage() {
  const campaign: FundingCampaign | null = await getCampaignDetails(CAMPAIGN_ID);
  const funders: Funder[] = await getRecentFunders(CAMPAIGN_ID, 15); // Fetch 15 recent funders

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
                priority // This image is likely LCP
              />
            </div>
            <CardContent className="p-6">
                 <FundingProgress campaign={campaign} />
            </CardContent>
          </Card>
          
          {campaign && funders.length > 0 && (
            <div className="block md:hidden"> {/* Show funders list here on mobile if campaign loaded */}
                <FundersList funders={funders} currency={campaign.currency} />
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <FundingForm />
          {campaign && funders.length > 0 && (
             <div className="hidden md:block mt-8"> {/* Show funders list here on desktop if campaign loaded */}
                <FundersList funders={funders} currency={campaign.currency} />
            </div>
          )}
           {(!campaign || funders.length === 0) && ( // Show empty state if no campaign or no funders for desktop
            <div className="hidden md:block">
                 <FundersList funders={[]} currency={campaign?.currency} />
            </div>
           )}
        </div>
      </div>
       {(!campaign || funders.length === 0) && ( // Show empty state if no campaign or no funders for mobile
            <div className="block md:hidden mt-8">
                 <FundersList funders={[]} currency={campaign?.currency} />
            </div>
        )}

    </PageContainer>
  );
}
