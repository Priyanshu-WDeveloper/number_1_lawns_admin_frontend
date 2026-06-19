import { useState } from 'react';
import { Loader2, Mail, Phone, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/ui/user-avatar';
import type { OrderItemInput } from '@/types';

interface CompleteJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (params: {
    receivePrice?: number;
    items: OrderItemInput[];
  }) => Promise<void>;
  paymentType?: string;
  jobDisplayId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerImage?: string;
  initialAddress?: string;
}

const emptyItem: OrderItemInput = {
  title: '',
  unitPrice: 0,
  quantity: 1,
  address: '',
};

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
  initialAddress,
}: CompleteJobDialogProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OrderItemInput[]>([]);
  const [editing, setEditing] = useState<OrderItemInput>({
    ...emptyItem,
  });

  const isCash = paymentType === 'cash';
  const grandTotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const addItem = () => {
    if (!editing.title || !editing.unitPrice) return;
    if (!editing.address && initialAddress) {
      editing.address = initialAddress;
    }
    setItems([...items, { ...editing }]);
    setEditing({ ...emptyItem, address: initialAddress ?? '' });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm({
        receivePrice: amount ? Number(amount) : undefined,
        items,
      });
      setAmount('');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-24px)] sm:max-w-xl rounded-3xl border-0 p-0 overflow-hidden shadow-2xl bg-white max-h-[90vh] flex flex-col">
        <div className="overflow-y-auto px-6 pt-8 sm:px-8 pb-4 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
              Complete Job
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-3 bg-zinc-50 rounded-xl p-4 border border-zinc-200">
            <UserAvatar
              image={customerImage}
              name={customerName ?? ''}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-900 truncate">
                {customerName || '-'}
              </p>
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {customerPhone || '-'}
                </span>
                {customerEmail && (
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{customerEmail}</span>
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs font-medium text-zinc-400 bg-zinc-200/60 px-2.5 py-1 rounded-full shrink-0">
              {jobDisplayId}
            </span>
          </div>

          {isCash && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <label className="block text-sm font-medium text-amber-800 mb-1.5">
                Received Amount ($)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600 font-medium">
                  $
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onWheel={(e) =>
                    (e.target as HTMLInputElement).blur()
                  }
                  disabled={loading}
                  className="pl-7 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield] h-12 rounded-xl border-amber-300 bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-zinc-800">
                Invoice Items
              </h4>
              <Button
                type="button"
                onClick={addItem}
                disabled={
                  !editing.title || !editing.unitPrice || loading
                }
                size="sm"
                className="h-8 gap-1 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>

            <div className="space-y-2 mb-3">
              <Input
                placeholder="Title"
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
                disabled={loading}
                className="h-10 rounded-xl text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={editing.unitPrice || ''}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        unitPrice: Number(e.target.value),
                      })
                    }
                    onWheel={(e) =>
                      (e.target as HTMLInputElement).blur()
                    }
                    disabled={loading}
                    className="pl-6 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield] h-10 rounded-xl text-sm"
                  />
                </div>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Qty"
                  value={editing.quantity || ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      quantity: Number(e.target.value),
                    })
                  }
                  onWheel={(e) =>
                    (e.target as HTMLInputElement).blur()
                  }
                  disabled={loading}
                  className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield] h-10 rounded-xl text-sm"
                />
              </div>
              <Input
                placeholder="Address"
                value={editing.address}
                onChange={(e) =>
                  setEditing({ ...editing, address: e.target.value })
                }
                disabled={loading}
                className="h-10 rounded-xl text-sm"
              />
            </div>
            {items.length > 0 && (
              <div className="rounded-xl border border-zinc-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="text-left px-3 py-2.5 font-medium text-zinc-600">
                        Address
                      </th>
                      <th className="text-left px-3 py-2.5 font-medium text-zinc-600">
                        Item
                      </th>
                      <th className="text-right px-3 py-2.5 font-medium text-zinc-600">
                        Price
                      </th>
                      <th className="text-center px-3 py-2.5 font-medium text-zinc-600 w-16">
                        Qty
                      </th>
                      <th className="text-right px-3 py-2.5 font-medium text-zinc-600 w-24">
                        Subtotal
                      </th>
                      <th className="w-10 px-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr
                        key={i}
                        className="border-b border-zinc-100 last:border-0"
                      >
                        <td className="px-3 py-2.5 text-zinc-900">
                          {item.address}
                        </td>
                        <td className="px-3 py-2.5 text-zinc-900">
                          {item.title}
                        </td>
                        <td className="px-3 py-2.5 text-right text-zinc-700">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-center text-zinc-700">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-zinc-900">
                          $
                          {(item.unitPrice * item.quantity).toFixed(
                            2,
                          )}
                        </td>
                        <td className="px-2 py-2.5">
                          <button
                            type="button"
                            onClick={() => removeItem(i)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-zinc-50 border-t border-zinc-200">
                      <td
                        colSpan={3}
                        className="px-3 py-3 text-right font-semibold text-zinc-800"
                      >
                        Grand Total
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-green-700">
                        ${grandTotal.toFixed(2)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-4 bg-zinc-50/80 border-t border-zinc-200/60 shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setAmount('');
              setItems([]);
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
