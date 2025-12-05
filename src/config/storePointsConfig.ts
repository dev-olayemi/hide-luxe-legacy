export const STORE_POINT_VALUE_NGN = 10;

export const calculateStorePointsValue = (points: number): number => {
  const safePoints = Number.isFinite(points) ? Math.max(0, Math.floor(points)) : 0;
  return safePoints * STORE_POINT_VALUE_NGN;
};
export const calculatePointsFromNGN = (ngn: number): number => {
  const safeNGN = Number.isFinite(ngn) ? Math.max(0, ngn) : 0;
  return Math.floor(safeNGN / STORE_POINT_VALUE_NGN);
};
