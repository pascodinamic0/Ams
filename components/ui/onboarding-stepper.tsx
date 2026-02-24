"use client";

import { Button } from "./button";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface OnboardingStepperProps {
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
  children: React.ReactNode;
}

export function OnboardingStepper({
  steps,
  currentStep,
  onNext,
  onBack,
  onComplete,
  children,
}: OnboardingStepperProps) {
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i <= currentStep
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700"
              }`}
            >
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-1 h-0.5 w-8 ${
                  i < currentStep ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.title}
      </p>
      <div>{children}</div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} disabled={currentStep === 0}>
          Back
        </Button>
        {isLast ? (
          <Button onClick={onComplete}>Complete</Button>
        ) : (
          <Button onClick={onNext}>Next</Button>
        )}
      </div>
    </div>
  );
}
