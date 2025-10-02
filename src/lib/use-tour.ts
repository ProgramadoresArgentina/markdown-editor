'use client';

import { useState, useEffect, useCallback } from 'react';

const TOUR_STORAGE_KEY = 'markdown-editor-tour-completed';

export function useTour() {
  const [runTour, setRunTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  // Verificar si el usuario ya vio el tour
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenTour = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!hasSeenTour) {
        // Si es la primera vez, mostrar el tour después de un pequeño delay
        const timer = setTimeout(() => {
          setRunTour(true);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setTourCompleted(true);
      }
    }
  }, []);

  const startTour = useCallback(() => {
    setRunTour(true);
    setTourCompleted(false);
  }, []);

  const stopTour = useCallback(() => {
    setRunTour(false);
  }, []);

  const completeTour = useCallback(() => {
    setRunTour(false);
    setTourCompleted(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    }
  }, []);

  const resetTour = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOUR_STORAGE_KEY);
    }
    setTourCompleted(false);
    setRunTour(true);
  }, []);

  return {
    runTour,
    tourCompleted,
    startTour,
    stopTour,
    completeTour,
    resetTour,
  };
}
