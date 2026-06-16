import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react'; // Import Loader2 for loading state

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  loading?: boolean; // Added loading prop
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Confirm Action',
  description = 'This action may affect your data. Please confirm to continue.',
  confirmText = 'Continue',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'destructive',
  loading = false, // Default value for loading
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[calc(100%-24px)]
          sm:max-w-md
          rounded-3xl
          border-0
          bg-white dark:bg-zinc-950
          p-0
          overflow-hidden
          shadow-2xl
        "
      >
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent" />

          <div className="relative flex flex-col items-center px-6 pt-8 sm:px-8">
            <DialogHeader className="mt-5 text-center space-y-3">
              <DialogTitle
                className="
                  text-xl sm:text-2xl
                  font-semibold
                  tracking-tight
                  text-zinc-900 dark:text-zinc-100
                "
              >
                {title}
              </DialogTitle>

              <DialogDescription
                className="
                  text-sm sm:text-base
                  leading-relaxed
                  text-zinc-500 dark:text-zinc-400
                  max-w-sm
                  mx-auto
                "
              >
                {description}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <DialogFooter
          className="
            flex-col-reverse sm:flex-row
            gap-3
            px-6 pb-6 pt-6
            sm:px-8
            bg-zinc-50/80 dark:bg-zinc-900/50
            border-t border-zinc-200/60 dark:border-zinc-800
          "
        >
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="
              h-12
              w-full
              sm:flex-1
              rounded-2xl
              border-zinc-300
              text-base
              font-medium
              transition-all
              hover:bg-zinc-100
              dark:hover:bg-zinc-800
            "
            disabled={loading} // Disable cancel button when loading
          >
            {cancelText}
          </Button>

          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={loading} // Disable confirm button when loading
            className="
              h-12
              w-full
              sm:flex-1
              rounded-2xl
              text-base
              font-medium
              shadow-lg
              transition-all
              hover:scale-[1.02]
              active:scale-[0.98]
            "
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
