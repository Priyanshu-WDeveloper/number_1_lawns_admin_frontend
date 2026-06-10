import { Shield } from 'lucide-react';

interface AdminFormStepperProps {
  steps: {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
  currentStep: number;
  children: React.ReactNode;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  isFirstStep: boolean;
  submitLabel?: string;
  formRef?: React.RefObject<HTMLFormElement | null>;
  onStepClick?: (step: number) => void;
  allowStepNavigation?: boolean;
}

export function AdminFormStepper({
  steps,
  currentStep,
  children,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
  isLastStep,
  isFirstStep,
  submitLabel,
  formRef,
  onStepClick: _onStepClick,
  allowStepNavigation: _allowStepNavigation,
}: AdminFormStepperProps) {
  const submittingLabel = submitLabel
    ? submitLabel.replace(/^Create/, 'Creating').replace(/^Edit/, 'Editing') + '...'
    : 'Submitting';

  const handleSubmit = () => {
    if (formRef?.current) {
      formRef.current.requestSubmit();
    } else {
      onSubmit();
    }
  };

  return (
    <div className="rounded-2xl border border-[#ececec] bg-white shadow-sm">
        <div className="border-b border-[#ececec] bg-background px-4 sm:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </p>
              <h3 className="text-xl font-semibold text-foreground">
                {steps[currentStep - 1].title}
              </h3>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8">{children}</div>

        <div className="flex items-center justify-between border-t border-[#ececec] bg-background px-4 sm:px-8 py-6">
          <button
            type="button"
            onClick={onPrevious}
            disabled={isFirstStep}
            className="h-12 rounded-xl border border-border px-6 text-muted-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
          >
            Previous
          </button>

          {!isLastStep ? (
            <button
              type="button"
              onClick={onNext}
              className="h-12 rounded-xl bg-green-600 px-8 text-white transition-all hover:bg-green-700"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-12 rounded-xl bg-green-600 px-8 text-white transition-all hover:bg-green-700 disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? submittingLabel : (submitLabel || 'Submit')}
            </button>
          )}
        </div>
    </div>
  );
}
