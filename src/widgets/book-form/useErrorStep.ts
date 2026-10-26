import { useState } from 'react';
import { bookFieldNames } from './draft';
import type { Step } from './StepHeading';

// The step a problem is on, to go back to it
const stepOf = (errors: Record<string, string>): Step | null =>
  bookFieldNames.some((name) => errors[name])
    ? 'book'
    : Object.keys(errors).some((key) => key.startsWith('copy.') && errors[key])
      ? 'copy'
      : null;

// A problem on the other step sends the reader over to it, as it turns up
export function useErrorStep(
  errors: Record<string, string>,
  setStep: (step: Step) => void,
) {
  const errorStep = stepOf(errors);
  const [sawErrorStep, setSawErrorStep] = useState(errorStep);
  if (errorStep !== sawErrorStep) {
    setSawErrorStep(errorStep);
    if (errorStep) setStep(errorStep);
  }
}
