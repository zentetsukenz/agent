import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScenarioSelector } from './ScenarioSelector';
import { scenariosAPI } from '../../services/scenarios';

// Mock the scenarios service
vi.mock('../../services/scenarios', () => ({
  scenariosAPI: {
    getAll: vi.fn(),
    getById: vi.fn(),
  },
}));

// Mock scenario data
const mockScenarios = [
  {
    id: 1,
    name: 'Smoke Test',
    description: 'Minimal load to verify endpoint works correctly.',
    mode: 'simple',
    isTemplate: true,
    phases: [
      { name: 'Smoke', duration: 60, connections: 2, type: 'constant' }
    ],
  },
  {
    id: 2,
    name: 'Average Load Test',
    description: 'Simulate typical production traffic with gradual ramp-up.',
    mode: 'simple',
    isTemplate: true,
    phases: [
      { name: 'Ramp Up', duration: 30, connections: 50, type: 'ramp' },
      { name: 'Sustain', duration: 120, connections: 50, type: 'constant' },
      { name: 'Cool Down', duration: 30, connections: 0, type: 'ramp' }
    ],
  },
  {
    id: 100,
    name: 'My Custom Workflow',
    description: 'A custom multi-step workflow test.',
    mode: 'workflow',
    isTemplate: false,
    phases: [
      { name: 'Baseline', duration: 60, connections: 25, type: 'constant' },
    ],
  },
];

describe('ScenarioSelector', () => {
  const defaultProps = {
    selectedScenarioId: null,
    onSelect: vi.fn(),
    onClear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    scenariosAPI.getAll.mockResolvedValue(mockScenarios);
  });

  describe('Loading State', () => {
    it('renders loading skeletons while fetching scenarios', () => {
      // Delay the response to test loading state
      scenariosAPI.getAll.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockScenarios), 100))
      );

      render(<ScenarioSelector {...defaultProps} />);
      
      expect(screen.getByTestId('scenario-selector-loading')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error message when fetch fails', async () => {
      scenariosAPI.getAll.mockRejectedValue(new Error('Network error'));

      render(<ScenarioSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Scenario List', () => {
    it('renders all scenarios after loading', async () => {
      render(<ScenarioSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
        expect(screen.getByText('Average Load Test')).toBeInTheDocument();
        expect(screen.getByText('My Custom Workflow')).toBeInTheDocument();
      });
    });

    it('shows template badge for template scenarios', async () => {
      render(<ScenarioSelector {...defaultProps} />);
      
      await waitFor(() => {
        const templateBadges = screen.getAllByText('Template');
        expect(templateBadges).toHaveLength(2); // Smoke Test and Average Load Test
      });
    });

    it('shows search input', async () => {
      render(<ScenarioSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search scenarios...')).toBeInTheDocument();
      });
    });

    it('shows filter dropdown', async () => {
      render(<ScenarioSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('filters scenarios by name', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search scenarios...');
      await user.type(searchInput, 'smoke');
      
      expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      expect(screen.queryByText('Average Load Test')).not.toBeInTheDocument();
      expect(screen.queryByText('My Custom Workflow')).not.toBeInTheDocument();
    });

    it('filters scenarios by description', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search scenarios...');
      await user.type(searchInput, 'production traffic');
      
      expect(screen.getByText('Average Load Test')).toBeInTheDocument();
      expect(screen.queryByText('Smoke Test')).not.toBeInTheDocument();
    });

    it('shows empty state when no results match search', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search scenarios...');
      await user.type(searchInput, 'nonexistent');
      
      expect(screen.getByText('No scenarios found')).toBeInTheDocument();
      expect(screen.getByText('Try a different search term')).toBeInTheDocument();
    });
  });

  describe('Filter Functionality', () => {
    it('has filter dropdown', async () => {
      render(<ScenarioSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByText('All')).toBeInTheDocument();
      });
    });
  });

  describe('Scenario Expansion', () => {
    it('expands scenario preview on click', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });

      // Click on Smoke Test card
      await user.click(screen.getByText('Smoke Test'));
      
      // Should show description in expanded view
      expect(screen.getByText('Minimal load to verify endpoint works correctly.')).toBeInTheDocument();
      // Should show Use button
      expect(screen.getByRole('button', { name: 'Use This Scenario' })).toBeInTheDocument();
    });

    it('collapses scenario preview on second click', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });

      // Expand
      await user.click(screen.getByText('Smoke Test'));
      expect(screen.getByRole('button', { name: 'Use This Scenario' })).toBeInTheDocument();

      // Collapse
      await user.click(screen.getByText('Smoke Test'));
      expect(screen.queryByRole('button', { name: 'Use This Scenario' })).not.toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('calls onSelect when "Use This Scenario" is clicked', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();
      render(<ScenarioSelector {...defaultProps} onSelect={onSelect} />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });

      // Expand and select
      await user.click(screen.getByText('Smoke Test'));
      await user.click(screen.getByRole('button', { name: 'Use This Scenario' }));
      
      expect(onSelect).toHaveBeenCalledWith(1);
    });
  });

  describe('Selected State', () => {
    it('shows selected scenario preview when scenarioId is provided', async () => {
      render(<ScenarioSelector {...defaultProps} selectedScenarioId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Selected Scenario')).toBeInTheDocument();
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });
    });

    it('shows scenario details in selected preview', async () => {
      render(<ScenarioSelector {...defaultProps} selectedScenarioId={2} />);
      
      await waitFor(() => {
        expect(screen.getByText('Average Load Test')).toBeInTheDocument();
        // Should show duration and connections info
        expect(screen.getByText('3m')).toBeInTheDocument(); // 180s = 3m
        expect(screen.getByText('Max 50 connections')).toBeInTheDocument();
        expect(screen.getByText('3 phases')).toBeInTheDocument();
      });
    });

    it('shows phase badges in selected preview', async () => {
      render(<ScenarioSelector {...defaultProps} selectedScenarioId={2} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Ramp Up: 30s/)).toBeInTheDocument();
        expect(screen.getByText(/Sustain: 2m/)).toBeInTheDocument();
        expect(screen.getByText(/Cool Down: 30s/)).toBeInTheDocument();
      });
    });

    it('shows Change button in selected state', async () => {
      render(<ScenarioSelector {...defaultProps} selectedScenarioId={1} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /change/i })).toBeInTheDocument();
      });
    });

    it('calls onClear when Change button is clicked', async () => {
      const onClear = vi.fn();
      const user = userEvent.setup();
      render(<ScenarioSelector {...defaultProps} selectedScenarioId={1} onClear={onClear} />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /change/i }));
      
      expect(onClear).toHaveBeenCalled();
    });

    it('shows template badge in selected preview', async () => {
      render(<ScenarioSelector {...defaultProps} selectedScenarioId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Template')).toBeInTheDocument();
      });
    });

    it('shows mode badge in selected preview', async () => {
      render(<ScenarioSelector {...defaultProps} selectedScenarioId={100} />);
      
      await waitFor(() => {
        expect(screen.getByText('workflow')).toBeInTheDocument();
      });
    });
  });

  describe('Duration Formatting', () => {
    it('formats seconds correctly', async () => {
      render(<ScenarioSelector {...defaultProps} selectedScenarioId={1} />);
      
      await waitFor(() => {
        // Smoke Test has 60s duration
        expect(screen.getByText('1m')).toBeInTheDocument();
      });
    });

    it('formats hours correctly for long scenarios', async () => {
      const longScenario = {
        ...mockScenarios[0],
        id: 999,
        name: 'Soak Test',
        phases: [{ name: 'Soak', duration: 3660, connections: 30, type: 'constant' }]
      };
      scenariosAPI.getAll.mockResolvedValue([...mockScenarios, longScenario]);
      
      render(<ScenarioSelector {...defaultProps} selectedScenarioId={999} />);
      
      await waitFor(() => {
        expect(screen.getByText('1h')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible search input', async () => {
      render(<ScenarioSelector {...defaultProps} />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search scenarios...');
        expect(searchInput).toBeInTheDocument();
        expect(searchInput.tagName.toLowerCase()).toBe('input');
      });
    });

    it('scenario cards are clickable', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });

      // Should be able to click and expand
      await user.click(screen.getByText('Smoke Test'));
      expect(screen.getByRole('button', { name: 'Use This Scenario' })).toBeInTheDocument();
    });
  });

  describe('Empty Scenarios', () => {
    it('shows empty state when no scenarios exist', async () => {
      scenariosAPI.getAll.mockResolvedValue([]);
      
      render(<ScenarioSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('No scenarios found')).toBeInTheDocument();
      });
    });
  });
});
