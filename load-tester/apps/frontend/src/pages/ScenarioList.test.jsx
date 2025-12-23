import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ScenarioList } from './ScenarioList';
import { scenariosAPI } from '@/services/scenarios';

// Mock the scenarios API
vi.mock('@/services/scenarios', () => ({
  scenariosAPI: {
    getAll: vi.fn(),
    duplicate: vi.fn(),
    delete: vi.fn(),
  },
  getTotalDuration: vi.fn((phases) => phases.reduce((sum, p) => sum + p.duration, 0)),
  getMaxConnections: vi.fn((phases) => Math.max(...phases.map(p => p.connections))),
  formatDuration: vi.fn((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock data
const mockTemplates = [
  {
    id: 1,
    name: 'Smoke Test',
    description: 'Minimal load test',
    isTemplate: true,
    phases: [{ name: 'Smoke', duration: 60, connections: 2, type: 'constant' }],
  },
  {
    id: 2,
    name: 'Stress Test',
    description: 'Heavy load test',
    isTemplate: true,
    phases: [{ name: 'Stress', duration: 120, connections: 100, type: 'ramp' }],
  },
];

const mockCustomScenarios = [
  {
    id: 100,
    name: 'My Custom Test',
    description: 'A custom scenario',
    isTemplate: false,
    phases: [{ name: 'Load', duration: 60, connections: 50, type: 'constant' }],
  },
];

const allScenarios = [...mockTemplates, ...mockCustomScenarios];

// Wrapper with router context
const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('ScenarioList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading skeletons while fetching', async () => {
      // Never resolve to keep loading state
      scenariosAPI.getAll.mockImplementation(() => new Promise(() => {}));
      
      const { container } = renderWithRouter(<ScenarioList />);
      
      // Should show skeleton elements
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no scenarios exist', async () => {
      scenariosAPI.getAll.mockResolvedValue([]);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByText('No scenarios yet')).toBeInTheDocument();
      });
      
      expect(screen.getByRole('link', { name: /create scenario/i })).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when fetch fails', async () => {
      scenariosAPI.getAll.mockRejectedValue(new Error('Network error'));
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        // ErrorMessage shows custom title and error.message
        expect(screen.getByText(/failed to load scenarios/i)).toBeInTheDocument();
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('shows retry button on error', async () => {
      scenariosAPI.getAll.mockRejectedValue(new Error('Network error'));
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        // ErrorMessage button text is "Try again"
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });
  });

  describe('Scenario Display', () => {
    it('displays page title and description', async () => {
      scenariosAPI.getAll.mockResolvedValue(allScenarios);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /scenarios/i })).toBeInTheDocument();
      });
      
      expect(screen.getByText(/reusable test configurations/i)).toBeInTheDocument();
    });

    it('displays template scenarios', async () => {
      scenariosAPI.getAll.mockResolvedValue(allScenarios);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Stress Test')).toBeInTheDocument();
    });

    it('displays custom scenarios', async () => {
      scenariosAPI.getAll.mockResolvedValue(allScenarios);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByText('My Custom Test')).toBeInTheDocument();
      });
    });

    it('shows Built-in Templates section heading', async () => {
      scenariosAPI.getAll.mockResolvedValue(allScenarios);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByText('Built-in Templates')).toBeInTheDocument();
      });
    });

    it('shows Custom Scenarios section heading', async () => {
      scenariosAPI.getAll.mockResolvedValue(allScenarios);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByText('Custom Scenarios')).toBeInTheDocument();
      });
    });

    it('shows Create Scenario button in header', async () => {
      scenariosAPI.getAll.mockResolvedValue(allScenarios);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        const createButtons = screen.getAllByRole('link', { name: /create scenario/i });
        expect(createButtons.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Search Functionality', () => {
    it('renders search input', async () => {
      scenariosAPI.getAll.mockResolvedValue(allScenarios);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search scenarios/i)).toBeInTheDocument();
      });
    });

    it('filters scenarios by search query', async () => {
      const user = userEvent.setup();
      scenariosAPI.getAll.mockResolvedValue(allScenarios);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/search scenarios/i);
      await user.type(searchInput, 'Smoke');
      
      // Smoke Test should still be visible
      expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      // Stress Test should be hidden
      expect(screen.queryByText('Stress Test')).not.toBeInTheDocument();
    });

    it('shows no results message when search has no matches', async () => {
      const user = userEvent.setup();
      scenariosAPI.getAll.mockResolvedValue(allScenarios);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/search scenarios/i);
      await user.type(searchInput, 'nonexistent');
      
      await waitFor(() => {
        expect(screen.getByText(/no matching scenarios/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filter Tabs', () => {
    it('renders filter tabs', async () => {
      scenariosAPI.getAll.mockResolvedValue(allScenarios);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
      });
      
      expect(screen.getByRole('button', { name: /templates/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /custom/i })).toBeInTheDocument();
    });

    it('filters to show only templates', async () => {
      const user = userEvent.setup();
      scenariosAPI.getAll.mockResolvedValue(allScenarios);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });
      
      const templatesTab = screen.getByRole('button', { name: /templates/i });
      await user.click(templatesTab);
      
      // Templates should be visible
      expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      expect(screen.getByText('Stress Test')).toBeInTheDocument();
      // Custom should be hidden
      expect(screen.queryByText('My Custom Test')).not.toBeInTheDocument();
    });

    it('filters to show only custom scenarios', async () => {
      const user = userEvent.setup();
      scenariosAPI.getAll.mockResolvedValue(allScenarios);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });
      
      const customTab = screen.getByRole('button', { name: /custom/i });
      await user.click(customTab);
      
      // Custom should be visible
      expect(screen.getByText('My Custom Test')).toBeInTheDocument();
      // Templates should be hidden
      expect(screen.queryByText('Smoke Test')).not.toBeInTheDocument();
    });
  });

  describe('Duplicate Functionality', () => {
    it('calls duplicate API when duplicate button clicked', async () => {
      const user = userEvent.setup();
      scenariosAPI.getAll.mockResolvedValue(mockTemplates);
      scenariosAPI.duplicate.mockResolvedValue({ 
        id: 101, 
        name: 'Smoke Test (Copy)' 
      });
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });
      
      const duplicateButtons = screen.getAllByRole('button', { name: /duplicate/i });
      await user.click(duplicateButtons[0]);
      
      expect(scenariosAPI.duplicate).toHaveBeenCalledWith(1);
    });

    it('refetches scenarios after successful duplicate', async () => {
      const user = userEvent.setup();
      scenariosAPI.getAll.mockResolvedValue(mockTemplates);
      scenariosAPI.duplicate.mockResolvedValue({ 
        id: 101, 
        name: 'Smoke Test (Copy)' 
      });
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByText('Smoke Test')).toBeInTheDocument();
      });
      
      const duplicateButtons = screen.getAllByRole('button', { name: /duplicate/i });
      await user.click(duplicateButtons[0]);
      
      await waitFor(() => {
        // getAll should be called twice - initial load and after duplicate
        expect(scenariosAPI.getAll).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Delete Functionality', () => {
    it('shows delete confirmation dialog', async () => {
      const user = userEvent.setup();
      scenariosAPI.getAll.mockResolvedValue(mockCustomScenarios);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByText('My Custom Test')).toBeInTheDocument();
      });
      
      // Find the delete button (icon-only, find by red styling)
      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.className.includes('text-red'));
      
      expect(deleteButton).toBeTruthy();
      await user.click(deleteButton);
      
      await waitFor(() => {
        expect(screen.getByText(/delete scenario/i)).toBeInTheDocument();
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });
    });

    it('calls delete API when confirmed', async () => {
      const user = userEvent.setup();
      scenariosAPI.getAll.mockResolvedValue(mockCustomScenarios);
      scenariosAPI.delete.mockResolvedValue({});
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByText('My Custom Test')).toBeInTheDocument();
      });
      
      // Click delete button
      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.className.includes('text-red'));
      await user.click(deleteButton);
      
      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /^delete$/i }));
      
      expect(scenariosAPI.delete).toHaveBeenCalledWith(100);
    });

    it('closes dialog when cancelled', async () => {
      const user = userEvent.setup();
      scenariosAPI.getAll.mockResolvedValue(mockCustomScenarios);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByText('My Custom Test')).toBeInTheDocument();
      });
      
      // Click delete button
      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.className.includes('text-red'));
      await user.click(deleteButton);
      
      // Cancel
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      
      // Dialog should close, delete should not be called
      expect(scenariosAPI.delete).not.toHaveBeenCalled();
    });
  });

  describe('Empty Custom Scenarios', () => {
    it('shows empty state for custom scenarios when only templates exist', async () => {
      scenariosAPI.getAll.mockResolvedValue(mockTemplates);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        expect(screen.getByText('No custom scenarios yet')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Links', () => {
    it('has Create Scenario link pointing to /scenarios/new', async () => {
      scenariosAPI.getAll.mockResolvedValue(allScenarios);
      
      renderWithRouter(<ScenarioList />);
      
      await waitFor(() => {
        const createLinks = screen.getAllByRole('link', { name: /create scenario/i });
        expect(createLinks[0]).toHaveAttribute('href', '/scenarios/new');
      });
    });
  });
});
