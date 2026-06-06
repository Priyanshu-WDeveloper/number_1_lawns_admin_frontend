import { useState } from 'react';
import { Loader2, Mail, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/ui/user-avatar';

interface CompleteJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (receivePrice?: number) => Promise<void>;
  paymentType?: string;
  jobDisplayId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerImage?: string;
}

export function CompleteJobDialog({
  open,
  onOpenChange,
  onConfirm,
  paymentType,
  jobDisplayId,
  customerName,
  customerPhone,
  customerEmail,
  customerImage,
}: CompleteJobDialogProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(amount ? Number(amount) : undefined);
      setAmount('');
    } finally {
      setLoading(false);
    }
  };

  const isCash = paymentType === 'cash';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-24px)] sm:max-w-md rounded-3xl border-0 p-0 overflow-hidden shadow-2xl bg-white">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent" />

          <div className="relative px-6 pt-8 sm:px-8">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
                Complete Job
              </DialogTitle>
            </DialogHeader>

            {isCash ? (
              <>
                <p className="text-sm text-zinc-500 mt-2 mb-6">
                  Enter the amount received from the customer
                  (optional).
                </p>

                <div className="pb-6">
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Received Amount ($)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                    className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield] h-12 rounded-xl"
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-zinc-600 mt-2 mb-6">
                  Are you sure you want to mark{' '}
                  <span className="font-semibold text-zinc-900">
                    {jobDisplayId}
                  </span>{' '}
                  job as completed?
                </p>

                <div className="pb-6">
                  <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar image={customerImage} name={customerName ?? ''} />
                      <div>
                        <p className="font-medium text-zinc-900">
                          {customerName || '-'}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-zinc-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            {customerPhone || '-'}
                          </span>
                          {customerEmail && (
                            <span className="inline-flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5" />
                              {customerEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-4 bg-zinc-50/80 border-t border-zinc-200/60">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setAmount('');
            }}
            disabled={loading}
            className="h-12 flex-1 rounded-2xl border-zinc-300 text-base font-medium"
          >
            Cancel
          </Button>
          <Button
            className="h-12 flex-1 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-base font-medium shadow-lg"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Mark Complete'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
