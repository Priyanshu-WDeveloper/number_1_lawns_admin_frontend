import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function PaymentStatusDialog({
  onClose,
  onUpdate,
  isLoading,
}: {
  onClose: () => void;
  onUpdate: (status: string) => void;
  isLoading: boolean;
}) {
  const [paymentStatus, setPaymentStatus] = useState('unpaid');

  const statusOptions = [
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'cancel', label: 'Cancel' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Update Payment Status</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Payment Status</label>
            <Select
              value={paymentStatus}
              onValueChange={setPaymentStatus}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onUpdate(paymentStatus)}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Update'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
