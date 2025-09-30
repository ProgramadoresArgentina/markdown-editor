'use client';

import { useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { tourSteps, tourStyles } from '@/lib/tour-steps';

interface TourGuideProps {
  run: boolean;
  onTourEnd: () => void;
  onTourSkip: () => void;
}

export function TourGuide({ run, onTourEnd, onTourSkip }: TourGuideProps) {
  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      onTourEnd();
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Aquí podrías agregar lógica adicional si necesitas
    }

    if (status === STATUS.SKIPPED) {
      onTourSkip();
    }
  }, [onTourEnd, onTourSkip]);

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={tourStyles}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar tour',
      }}
      floaterProps={{
        disableAnimation: false,
      }}
      disableOverlayClose={true}
      disableScrollParentFix={true}
      spotlightClicks={false}
      hideCloseButton={false}
    />
  );
}
