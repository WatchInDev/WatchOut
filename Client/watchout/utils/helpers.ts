import { CoordinatesRect } from "./types";

export function hoursToMilliseconds(hours: number): number {
  return hours * 60 * 60 * 1000;
}

 export function roundToInterval(value: number, interval: number): number {
  if (interval <= 0) return value;

  return Math.round(value / interval) * interval;
};

export function enlargeCoordinates(coordinates: CoordinatesRect, margin: number): CoordinatesRect {
  return {
    neLat: coordinates.neLat + margin,
    neLng: coordinates.neLng + margin,
    swLat: coordinates.swLat - margin,
    swLng: coordinates.swLng - margin,
  };
};

export function roundCoordinates(coordinates: CoordinatesRect, interval: number): CoordinatesRect {
  return {
    neLat: roundToInterval(coordinates.neLat, interval),
    neLng: roundToInterval(coordinates.neLng, interval),
    swLat: roundToInterval(coordinates.swLat, interval),
    swLng: roundToInterval(coordinates.swLng, interval),
  };
};

export function stringifyCoordinatesWithInterval(coordinates: CoordinatesRect, interval: number) {
  const { neLat, neLng, swLat, swLng } = roundCoordinates(coordinates, interval);
  return `${neLat},${neLng},${swLat},${swLng}`;
};