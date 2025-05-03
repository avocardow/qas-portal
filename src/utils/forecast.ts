export interface DataPoint {
  date: string;
  value: number;
}

/**
 * Compute a linear forecast for the next `months` months using linear regression on timestamp vs. value.
 * Returns an array of DataPoint with future monthly dates and projected values.
 */
export function computeLinearForecast(
  data: DataPoint[],
  months: number = 12
): DataPoint[] {
  if (data.length < 2) {
    return [];
  }
  // Convert to numeric timestamps
  const points = data.map((d) => ({
    t: new Date(d.date).getTime(),
    y: d.value,
  }));
  const n = points.length;
  const tAvg = points.reduce((sum, p) => sum + p.t, 0) / n;
  const yAvg = points.reduce((sum, p) => sum + p.y, 0) / n;
  // Compute slope (m) and intercept (b) for y = m * t + b
  const numerator = points.reduce((sum, p) => sum + (p.t - tAvg) * (p.y - yAvg), 0);
  const denominator = points.reduce((sum, p) => sum + (p.t - tAvg) ** 2, 0);
  if (denominator === 0) {
    return [];
  }
  const m = numerator / denominator;
  const b = yAvg - m * tAvg;
  // Generate forecast points
  const forecast: DataPoint[] = [];
  let lastDate = new Date(points[n - 1].t);
  for (let i = 1; i <= months; i++) {
    // Advance by one month
    lastDate = new Date(lastDate.setMonth(lastDate.getMonth() + 1));
    const t = lastDate.getTime();
    const y = m * t + b;
    forecast.push({
      date: lastDate.toISOString().split('T')[0],
      // Round to nearest integer and ensure non-negative
      value: Math.max(0, Math.round(y)),
    });
  }
  return forecast;
} 