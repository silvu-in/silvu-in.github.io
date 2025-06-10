
'use client';

import { Progress } from '@/components/ui/progress';
import type { FundingCampaign } from '@/types';

interface FundingProgressProps {
  campaign: FundingCampaign | null;
}

export function FundingProgress({ campaign }: FundingProgressProps) {
  if (!campaign) {
    return (
      <div className="p-4 border rounded-lg bg-muted text-muted-foreground text-center">
        Funding campaign details are currently unavailable.
      </div>
    );
  }

  const { currentAmount, goalAmount, currency } = campaign;
  const progressPercentage = goalAmount > 0 ? (currentAmount / goalAmount) * 100 : 0;
  const cappedProgress = Math.min(progressPercentage, 100); // Cap at 100%

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-3 p-6 rounded-lg shadow-md border bg-card">
      <div className="flex justify-between items-baseline">
        <span className="text-2xl font-bold text-primary">
          {formatCurrency(currentAmount)}
        </span>
        <span className="text-sm text-muted-foreground">
          raised of {formatCurrency(goalAmount)} goal
        </span>
      </div>
      <Progress value={cappedProgress} className="h-4 rounded-full" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{cappedProgress.toFixed(0)}% funded</span>
        {currentAmount > goalAmount && (
            <span className="font-semibold text-green-600">Goal Reached! +{formatCurrency(currentAmount - goalAmount)}</span>
        )}
      </div>
    </div>
  );
}
