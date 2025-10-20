import { useState, useEffect, useCallback } from "react";


export function useMapLongPress(
  onLongPress: (coords: { lat: number; lng: number }) => void
) {
  const [isPressing, setIsPressing] = useState(false);
  const [pressPosition, setPressPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null;

    if (isPressing && pressPosition) {
      // Uruchamiaj callback po upływie DELAY
      timerId = setTimeout(() => {
        onLongPress(pressPosition);
        setIsPressing(false); // Resetuj stan po udanym long press
      }, LONG_PRESS_DELAY);
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [isPressing, pressPosition, onLongPress]);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    const coords = extractCoords(event);
    if (coords) {
      setPressPosition(coords);
      setIsPressing(true);
    }
  }, []);

  // Anuluje long press, jeśli zdarzy się przed czasem
  const handleCancel = useCallback(() => {
    setIsPressing(false);
    setPressPosition(null);
  }, []);

  return {
    // Używamy uniwersalnych handlerów Pointer, które obsługują mysz i dotyk
    onPointerDown: handlePointerDown,
    onPointerUp: handleCancel,
    onPointerCancel: handleCancel,

    // Ważne: Anuluj, jeśli nastąpi ruch (czyli jest to "przesunięcie" mapy)
    onPointerMove: handleCancel,

    // Zdarzenia Drag są kluczowe w vis.gl
    onDragStart: handleCancel,
  };
}
