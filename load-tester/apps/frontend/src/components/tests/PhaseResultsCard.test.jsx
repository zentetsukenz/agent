import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PhaseResultsCard } from './PhaseResultsCard';

// Mock phase results data
const mockPhaseResults = [
  {
    phaseName: 'Ramp Up',
    duration: 30,
    requests: { total: 1500, average: 50, sent: 1500 },
    latency: { min: 5, max: 200, mean: 45, p50: 40, p90: 80, p95: 100, p99: 150 },
    throughput: { average: 102400, total: 3072000 },
    errors: 0,
    timeouts: 0,
  },
  {
    phaseName: 'Sustain',
    duration: 120,
    requests: { total: 12000, average: 100, sent: 12000 },
    latency: { min: 8, max: 350, mean: 55, p50: 50, p90: 100, p95: 130, p99: 200 },
    throughput: { average: 204800, total: 24576000 },
    errors: 5,
    timeouts: 2,
  },
  {
    phaseName: 'Ramp Down',
    duration: 30,
    requests: { total: 1000, average: 33, sent: 1000 },
    latency: { min: 3, max: 150, mean: 35, p50: 30, p90: 60, p95: 80, p99: 120 },
    throughput: { average: 81920, total: 2457600 },
    errors: 0,
    timeouts: 0,
  },
];

describe('PhaseResultsCard', () => {
  describe('Basic Rendering', () => {
    it('renders phase results card with correct title', () => {
      render(<PhaseResultsCard phaseResults={mockPhaseResults} />);
      
      expect(screen.getByText('Phase Results')).toBeInTheDocument();
    });

    it('displays the correct number of phases badge', () => {
      render(<PhaseResultsCard phaseResults={mockPhaseResults} />);
      
      expect(screen.getByText('3 phases')).toBeInTheDocument();
    });

    it('renders singular "phase" for single phase', () => {
      render(<PhaseResultsCard phaseResults={[mockPhaseResults[0]]} />);
      
      expect(screen.getByText('1 phase')).toBeInTheDocument();
    });

    it('renders all phase names', () => {
      render(<PhaseResultsCard phaseResults={mockPhaseResults} />);
      
      expect(screen.getByText('Ramp Up')).toBeInTheDocument();
      expect(screen.getByText('Sustain')).toBeInTheDocument();
      expect(screen.getByText('Ramp Down')).toBeInTheDocument();
    });

    it('renders phase number badges', () => {
      render(<PhaseResultsCard phaseResults={mockPhaseResults} />);
      
      expect(screen.getByText('Phase 1')).toBeInTheDocument();
      expect(screen.getByText('Phase 2')).toBeInTheDocument();
      expect(screen.getByText('Phase 3')).toBeInTheDocument();
    });
  });

  describe('Metric Display', () => {
    it('displays request counts', () => {
      render(<PhaseResultsCard phaseResults={[mockPhaseResults[0]]} />);
      
      // Total requests formatted
      expect(screen.getByText('1,500')).toBeInTheDocument();
    });

    it('displays request rate', () => {
      render(<PhaseResultsCard phaseResults={[mockPhaseResults[0]]} />);
      
      // 50/sec average
      expect(screen.getByText('50/sec')).toBeInTheDocument();
    });

    it('displays duration', () => {
      render(<PhaseResultsCard phaseResults={[mockPhaseResults[0]]} />);
      
      // 30 seconds
      expect(screen.getByText('30s')).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('displays zero errors in green', () => {
      render(<PhaseResultsCard phaseResults={[mockPhaseResults[0]]} />);
      
      const errorElement = screen.getByText('0');
      expect(errorElement).toHaveClass('text-green-600');
    });

    it('displays errors in red when present', () => {
      render(<PhaseResultsCard phaseResults={[mockPhaseResults[1]]} />);
      
      // 5 errors + 2 timeouts = 7
      const errorElement = screen.getByText('7');
      expect(errorElement).toHaveClass('text-red-600');
    });

    it('displays "No errors" text when errors are zero', () => {
      render(<PhaseResultsCard phaseResults={[mockPhaseResults[0]]} />);
      
      expect(screen.getByText('No errors')).toBeInTheDocument();
    });

    it('displays error rate when errors present', () => {
      render(<PhaseResultsCard phaseResults={[mockPhaseResults[1]]} />);
      
      // Should show error rate text
      expect(screen.getByText(/error rate/i)).toBeInTheDocument();
    });
  });

  describe('Null/Empty Handling', () => {
    it('returns null when phaseResults is null', () => {
      const { container } = render(<PhaseResultsCard phaseResults={null} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('returns null when phaseResults is empty array', () => {
      const { container } = render(<PhaseResultsCard phaseResults={[]} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('returns null when phaseResults is undefined', () => {
      const { container } = render(<PhaseResultsCard phaseResults={undefined} />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Data Test IDs', () => {
    it('renders phase-results-card test id', () => {
      render(<PhaseResultsCard phaseResults={mockPhaseResults} />);
      
      expect(screen.getByTestId('phase-results-card')).toBeInTheDocument();
    });

    it('renders phase-result test ids for each phase', () => {
      render(<PhaseResultsCard phaseResults={mockPhaseResults} />);
      
      expect(screen.getByTestId('phase-result-0')).toBeInTheDocument();
      expect(screen.getByTestId('phase-result-1')).toBeInTheDocument();
      expect(screen.getByTestId('phase-result-2')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles phase with missing requests data gracefully', () => {
      const phaseWithMissingData = {
        phaseName: 'Incomplete',
        duration: 10,
        latency: {},
        throughput: {},
      };
      
      render(<PhaseResultsCard phaseResults={[phaseWithMissingData]} />);
      
      expect(screen.getByText('Incomplete')).toBeInTheDocument();
    });

    it('handles phase with zero duration', () => {
      const phaseZeroDuration = {
        ...mockPhaseResults[0],
        duration: 0,
      };
      
      render(<PhaseResultsCard phaseResults={[phaseZeroDuration]} />);
      
      expect(screen.getByText('0s')).toBeInTheDocument();
    });
  });
});
