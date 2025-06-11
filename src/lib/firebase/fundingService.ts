
import { db } from './client';
import { doc, getDoc, collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import type { FundingCampaign, Funder } from '@/types';
import { format } from 'date-fns';

const CAMPAIGNS_COLLECTION = 'fundingCampaigns';
const FUND_COLLECTION = 'FUND'; // New top-level collection for funders

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
  let dateStr = 'Date not available';
  // Assuming 'date' field in Firestore is a Timestamp
  if (data.date && data.date instanceof Timestamp) {
    dateStr = format(data.date.toDate(), 'MMMM d, yyyy');
  } else if (typeof data.date === 'string') { // Fallback if date is already a string
    try {
      dateStr = format(new Date(data.date), 'MMMM d, yyyy');
    } catch (e) { /* Keep default if parsing fails */ }
  }


  return {
    id: document.id,
    name: data.name || 'Anonymous Funder',
    amount: data.amount || 0,
    date: dateStr, // Use the 'date' field
    avatarUrl: data.avatarUrl, // Keep existing avatar logic
    message: data.message,
    dataAiHint: data.dataAiHint || 'person abstract',
    // accountDetails: data.accountDetails, // Not for public display
  };
}

/**
 * Fetches details for a specific funding campaign.
 * @param campaignId The ID of the campaign document in Firestore.
 *                   Defaults to 'mainCampaign'.
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
 * Fetches a list of recent funders from the 'FUND' collection.
 * @param count The number of recent funders to fetch. Defaults to 10.
 * Each document in 'FUND' should have fields like:
 * - name (string)
 * - amount (number)
 * - date (Timestamp)
 * - avatarUrl (string, optional)
 * - message (string, optional)
 */
export async function getRecentFunders(count: number = 10): Promise<Funder[]> {
  try {
    const fundersRef = collection(db, FUND_COLLECTION);
    // Assuming 'date' is the field to order by and it's a Firestore Timestamp
    const q = query(fundersRef, orderBy('date', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDocToFunder);
  } catch (error) {
    console.error(`Error fetching recent funders from ${FUND_COLLECTION}:`, error);
    return [];
  }
}
