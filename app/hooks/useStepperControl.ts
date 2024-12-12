import { useState } from 'react';

interface StepperControl {
  activeStep: number;
  completed: { [k: number]: boolean };
  setCompleted: React.Dispatch<React.SetStateAction<{ [k: number]: boolean }>>;  // Add this line
  handleNext: () => void;
  handleBack: () => void;
  handleStep: (step: number) => () => void;
  handleComplete: () => void;
  handleReset: () => void;
}

export const useStepperControl = (totalSteps: number): StepperControl => {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<{ [k: number]: boolean }>({});

  const isLastStep = () => activeStep === totalSteps - 1;

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const handleComplete = () => {
    const newCompleted = completed;
    newCompleted[activeStep] = true;
    setCompleted(newCompleted);
    handleNext();
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };

  return {
    activeStep,
    completed,
    handleNext,
    handleBack,
    handleStep,
    handleComplete,
    handleReset,
    setCompleted,  // Add this line
  };
};