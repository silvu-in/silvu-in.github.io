
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck } from 'lucide-react'; // CreditCard icon removed
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UPI_PAYMENT_STRING = "upi://pay?pa=6202336939@fam&pn=Krish Verma";

export function FundingForm() {
  const [amount, setAmount] = useState('');
  const [showUpiQrDialog, setShowUpiQrDialog] = useState(false);
  const [upiUriWithAmount, setUpiUriWithAmount] = useState(UPI_PAYMENT_STRING);
  const { toast } = useToast();

  const handleFund = (method: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to fund.',
        variant: 'destructive',
      });
      return;
    }

    if (method === 'UPI') {
      const parsedAmount = parseFloat(amount).toFixed(2);
      if (UPI_PAYMENT_STRING.includes('&am=')) {
        setUpiUriWithAmount(UPI_PAYMENT_STRING.replace(/&am=[\d.]+/, `&am=${parsedAmount}`));
      } else if (UPI_PAYMENT_STRING.includes('?am=')) {
         setUpiUriWithAmount(UPI_PAYMENT_STRING.replace(/\?am=[\d.]+/, `?am=${parsedAmount}`));
      }
      else {
         setUpiUriWithAmount(`${UPI_PAYMENT_STRING}&am=${parsedAmount}`);
      }
      setShowUpiQrDialog(true);
    } 
    // Card payment logic removed
  };

  return (
    <>
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Contribute to Our Vision</CardTitle>
          <CardDescription>Every contribution helps us innovate and grow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="fundingAmount" className="text-base">Amount (INR)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground text-lg">₹</span>
              <Input
                id="fundingAmount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 text-lg h-12"
              />
            </div>
          </div>
          <div className="space-y-3">
              <Button onClick={() => handleFund('UPI')} size="lg" className="w-full">
                  <ShieldCheck className="mr-2 h-5 w-5" /> Fund with UPI
              </Button>
              {/* Card/Netbanking button removed
              <Button onClick={() => handleFund('Card')} variant="outline" size="lg" className="w-full">
                  <CreditCard className="mr-2 h-5 w-5" /> Fund with Card/Netbanking
              </Button>
              */}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
              Your contributions are highly valued. Secure processing (simulated for UPI).
          </p>
        </CardFooter>
      </Card>

      <AlertDialog open={showUpiQrDialog} onOpenChange={setShowUpiQrDialog}>
        <AlertDialogContent className="max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle>Scan to Pay with UPI</AlertDialogTitle>
            <AlertDialogDescription>
              Scan the QR code below with your preferred UPI app to complete the payment of ₹{parseFloat(amount || "0").toFixed(2)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-4">
            <QRCodeSVG value={upiUriWithAmount} size={200} includeMargin={true} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUpiQrDialog(false)}>Close</AlertDialogCancel>
            {/* <AlertDialogAction onClick={() => {
                setShowUpiQrDialog(false);
                toast({ title: "Payment Initiated", description: "Waiting for UPI payment confirmation (mock)." });
                setAmount('');
            }}>Paid</AlertDialogAction> */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
