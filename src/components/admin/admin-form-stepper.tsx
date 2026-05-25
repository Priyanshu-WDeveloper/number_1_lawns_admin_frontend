import { Shield } from 'lucide-react';

interface AdminFormStepperProps {
  steps: {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
  currentStep: number;
  onStepClick: (step: number) => void;
  children: React.ReactNode;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  isFirstStep: boolean;
  allowStepNavigation?: boolean;
  submitLabel?: string;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export function AdminFormStepper({
  steps,
  currentStep,
  onStepClick: _onStepClick,
  children,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
  isLastStep,
  isFirstStep,
  allowStepNavigation: _allowStepNavigation = false,
  submitLabel,
  formRef,
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
        <div className="border-b border-[#ececec] bg-[#fafaf8] px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf8e7]">
              <Shield className="h-6 w-6 text-[#16610E]" />
            </div>
            <div>
              <p className="text-sm text-[#777]">
                Step {currentStep} of {steps.length}
              </p>
              <h3 className="text-xl font-semibold text-[#151515]">
                {steps[currentStep - 1].title}
              </h3>
            </div>
          </div>
        </div>

        <div className="p-8">{children}</div>

        <div className="flex items-center justify-between border-t border-[#ececec] bg-[#fafaf8] px-8 py-6">
          <button
            type="button"
            onClick={onPrevious}
            disabled={isFirstStep}
            className="h-12 rounded-xl border border-[#e5e5e5] px-6 text-[#777] transition-all hover:border-[#16610E] hover:bg-[#edf8e7] hover:text-[#16610E] disabled:pointer-events-none disabled:opacity-50"
          >
            Previous
          </button>

          {!isLastStep ? (
            <button
              type="button"
              onClick={onNext}
              className="h-12 rounded-xl bg-[#16610E] px-8 text-white transition-all hover:bg-[#1a7a12]"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-12 rounded-xl bg-[#16610E] px-8 text-white transition-all hover:bg-[#1a7a12] disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? submittingLabel : (submitLabel || 'Submit')}
            </button>
          )}
        </div>
    </div>
  );
}
