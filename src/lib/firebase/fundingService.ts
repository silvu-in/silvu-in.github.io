
import { db } from './client';
import { doc, getDoc, collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import type { FundingCampaign, Funder } from '@/types';
import { format } from 'date-fns';

const CAMPAIGNS_COLLECTION = 'fundingCampaigns';
const DONATIONS_SUBCOLLECTION = 'donations';

// Helper to map Firestore document to FundingCampaign type
function mapDocToFundingCampaign(document: any): FundingCampaign {
  const data = document.data();
  return {
    id: document.id,
    goalAmount: data.goalAmount || 0,
    currentAmount: data.currentAmount || 0,
    campaignTitle: data.campaignTitle || 'Support Our Mission',
    campaignDescription: data.campaignDescription || 'Help us achieve our goals.',
    currency: data.currency || 'INR',
  };
}

// Helper to map Firestore document to Funder type
function mapDocToFunder(document: any): Funder {
  const data = document.data();
  let fundedAtStr = 'Date not available';
  if (data.fundedAt && data.fundedAt instanceof Timestamp) {
    fundedAtStr = format(data.fundedAt.toDate(), 'MMMM d, yyyy');
  } else if (typeof data.fundedAt === 'string') {
    try {
      fundedAtStr = format(new Date(data.fundedAt), 'MMMM d, yyyy');
    } catch (e) { /* Keep default */ }
  }

  return {
    id: document.id,
    name: data.name || 'Anonymous Funder',
    amount: data.amount || 0,
    fundedAt: fundedAtStr,
    avatarUrl: data.avatarUrl,
    message: data.message,
    dataAiHint: data.dataAiHint || 'person abstract', // Default hint for avatar
  };
}

/**
 * Fetches details for a specific funding campaign.
 * @param campaignId The ID of the campaign document in Firestore.
 *                   Defaults to 'mainCampaign'.
 * You should create a document with this ID in your 'fundingCampaigns' collection.
 * It should contain fields like:
 * - goalAmount (number)
 * - currentAmount (number)
 * - campaignTitle (string)
 * - campaignDescription (string)
 * - currency (string, e.g., "INR")
 */
export async function getCampaignDetails(campaignId: string = 'mainCampaign'): Promise<FundingCampaign | null> {
  try {
    const campaignDocRef = doc(db, CAMPAIGNS_COLLECTION, campaignId);
    const docSnap = await getDoc(campaignDocRef);
    if (docSnap.exists()) {
      return mapDocToFundingCampaign(docSnap);
    }
    console.warn(`Campaign with ID ${campaignId} not found.`);
    return null;
  } catch (error) {
    console.error(`Error fetching campaign details for ${campaignId}:`, error);
    return null;
  }
}

/**
 * Fetches a list of recent funders for a specific campaign.
 * @param campaignId The ID of the campaign document. Defaults to 'mainCampaign'.
 * @param count The number of recent funders to fetch. Defaults to 10.
 * Assumes a subcollection named 'donations' under the campaign document.
 * Each document in 'donations' should have fields like:
 * - name (string)
 * - amount (number)
 * - fundedAt (Timestamp)
 * - avatarUrl (string, optional)
 * - message (string, optional)
 */
export async function getRecentFunders(campaignId: string = 'mainCampaign', count: number = 10): Promise<Funder[]> {
  try {
    const donationsRef = collection(db, CAMPAIGNS_COLLECTION, campaignId, DONATIONS_SUBCOLLECTION);
    const q = query(donationsRef, orderBy('fundedAt', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDocToFunder);
  } catch (error) {
    console.error(`Error fetching recent funders for campaign ${campaignId}:`, error);
    return [];
  }
}
