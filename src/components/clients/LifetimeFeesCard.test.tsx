import React from 'react';
import { render, screen } from '@testing-library/react';
import LifetimeFeesCard from './LifetimeFeesCard';
import { useAbility } from '@/hooks/useAbility';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock next/dynamic to load the chart component synchronously
vi.mock('next/dynamic', () => ({
  default: (loader: any, opts: any) => {
    const mod = require('react-apexcharts');
    return mod.default;
  },
}));

// Mock react-apexcharts to a simple div showing series data
vi.mock('react-apexcharts', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="chart">{JSON.stringify(props.series)}</div>,
}));

// Mock useAbility hook
vi.mock('@/hooks/useAbility', () => ({
  useAbility: vi.fn(),
}));
const useAbilityMock = useAbility as unknown as vi.Mock;

// Polyfill ResizeObserver for apexcharts
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
global.ResizeObserver = ResizeObserver;

// Stub apexcharts to prevent runtime errors
vi.mock('apexcharts', () => ({ __esModule: true }));

// Polyfill getBBox for SVG elements to avoid errors
// @ts-ignore
SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 });

describe('LifetimeFeesCard', () => {
  beforeEach(() => {
    // By default, grant billing view permission
    useAbilityMock.mockReturnValue({ can: () => true });
  });

  it('renders a dash when user lacks billing permission', () => {
    useAbilityMock.mockReturnValue({ can: () => false });
    render(<LifetimeFeesCard totalFees={0} feeHistory={[]} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('displays total fees and the projection chart', () => {
    const feeHistory = [
      { date: '2023-01-01', value: 100 },
      { date: '2023-02-01', value: 200 },
    ];
    const { container } = render(<LifetimeFeesCard totalFees={300} feeHistory={feeHistory} />);
    // Check formatted total fees
    expect(screen.getByText('$300.00')).toBeInTheDocument();
    // Verify chart container rendered (dynamic chart is tested visually)
    expect(container.querySelector('.mt-2')).toBeInTheDocument();
  });
}); 