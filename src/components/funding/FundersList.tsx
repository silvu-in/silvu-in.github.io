
import type { Funder } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FundersListProps {
  funders: Funder[];
  currency?: string;
}

export function FundersList({ funders, currency = "INR" }: FundersListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(amount);
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length -1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (funders.length === 0) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl">Recent Supporters</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Be the first to support this campaign!
            <br />
            <span className="text-xs mt-1 block">
              If your name is not showing after a contribution, please wait 1-2 days for it to appear, or contact support.
            </span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Our Valued Supporters</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-3">
          <ul className="space-y-4">
            {funders.map((funder) => (
              <li key={funder.id} className="flex items-center space-x-4 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={funder.avatarUrl} alt={funder.name} data-ai-hint={funder.dataAiHint || 'person abstract'} />
                  <AvatarFallback>{getInitials(funder.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{funder.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Contributed {formatCurrency(funder.amount)} on {funder.fundedAt}
                  </p>
                  {funder.message && <p className="text-xs italic text-muted-foreground mt-1">"{funder.message}"</p>}
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
