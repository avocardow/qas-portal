import { describe, it, expect } from 'vitest';
import { computeLinearForecast, DataPoint } from './forecast';

describe('computeLinearForecast', () => {
  it('returns empty array when data length is less than 2', () => {
    const result = computeLinearForecast([], 5);
    expect(result).toEqual([]);
    const onePoint: DataPoint[] = [{ date: '2023-01-01', value: 100 }];
    expect(computeLinearForecast(onePoint, 3)).toEqual([]);
  });

  it('returns constant projection when data values are constant', () => {
    const data: DataPoint[] = [
      { date: '2023-01-01', value: 100 },
      { date: '2023-02-01', value: 100 },
    ];
    const forecast = computeLinearForecast(data, 3);
    // Should produce next 3 months with same value
    expect(forecast).toHaveLength(3);
    expect(forecast[0].date).toBe('2023-03-01');
    expect(forecast[1].date).toBe('2023-04-01');
    expect(forecast[2].date).toBe('2023-05-01');
    forecast.forEach((pt) => expect(pt.value).toBe(100));
  });
}); 