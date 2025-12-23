import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScenarioForm } from './ScenarioForm';

// Mock ResizeObserver for Recharts
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

describe('ScenarioForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    isSubmitting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders form with all sections', () => {
      render(<ScenarioForm {...defaultProps} />);
      
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Load Profile')).toBeInTheDocument();
      expect(screen.getByText('Phases')).toBeInTheDocument();
    });

    it('renders scenario name input', () => {
      render(<ScenarioForm {...defaultProps} />);
      expect(screen.getByLabelText(/scenario name/i)).toBeInTheDocument();
    });

    it('renders description textarea', () => {
      render(<ScenarioForm {...defaultProps} />);
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('renders mode display', () => {
      render(<ScenarioForm {...defaultProps} />);
      expect(screen.getByText('Simple')).toBeInTheDocument();
    });

    it('renders at least one phase', () => {
      render(<ScenarioForm {...defaultProps} />);
      // Phase 1 appears in timeline and editor - use getAllByText
      expect(screen.getAllByText(/Phase 1/)[0]).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      render(<ScenarioForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save scenario/i })).toBeInTheDocument();
    });

    it('renders Add Phase button', () => {
      render(<ScenarioForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /add phase/i })).toBeInTheDocument();
    });
  });

  describe('Initial Data', () => {
    it('pre-fills form with initial data', () => {
      const initialData = {
        name: 'Test Scenario',
        description: 'Test description',
        mode: 'simple',
        phases: [
          { name: 'Phase A', duration: 30, connections: 20, type: 'ramp' },
        ],
      };

      render(<ScenarioForm {...defaultProps} initialData={initialData} />);
      
      expect(screen.getByDisplayValue('Test Scenario')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Phase A')).toBeInTheDocument();
    });
  });

  describe('Phase Management', () => {
    it('adds a new phase when Add Phase is clicked', async () => {
      const user = userEvent.setup();
      render(<ScenarioForm {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /add phase/i });
      await user.click(addButton);
      
      // Phase 2 appears in timeline and editor - use getAllByText
      expect(screen.getAllByText(/Phase 2/)[0]).toBeInTheDocument();
    });

    it('removes a phase when delete is clicked', async () => {
      const user = userEvent.setup();
      render(<ScenarioForm {...defaultProps} />);
      
      // Add a second phase first
      await user.click(screen.getByRole('button', { name: /add phase/i }));
      expect(screen.getAllByText(/Phase 2/)[0]).toBeInTheDocument();
      
      // Delete the first phase
      const deleteButtons = screen.getAllByTitle('Delete phase');
      await user.click(deleteButtons[0]);
      
      // Should only have one phase now (renumbered after delete)
      expect(screen.getAllByTitle('Delete phase')).toHaveLength(1);
    });

    it('cannot delete the last phase', async () => {
      render(<ScenarioForm {...defaultProps} />);
      
      // Only one phase exists
      const deleteButton = screen.getByTitle('Delete phase');
      expect(deleteButton).toBeDisabled();
    });

    it('moves phase up when move up is clicked', async () => {
      const user = userEvent.setup();
      const initialData = {
        name: '',
        description: '',
        phases: [
          { name: 'First', duration: 30, connections: 10, type: 'constant' },
          { name: 'Second', duration: 60, connections: 20, type: 'constant' },
        ],
      };
      
      render(<ScenarioForm {...defaultProps} initialData={initialData} />);
      
      // Get move up button for second phase
      const moveUpButtons = screen.getAllByTitle('Move up');
      await user.click(moveUpButtons[1]); // Click move up on second phase
      
      // Now "Second" should be first
      const phaseInputs = screen.getAllByLabelText(/^name \*$/i);
      expect(phaseInputs[0]).toHaveValue('Second');
      expect(phaseInputs[1]).toHaveValue('First');
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with form data when submitted', async () => {
      const user = userEvent.setup();
      render(<ScenarioForm {...defaultProps} />);
      
      // Fill in required fields
      await user.type(screen.getByLabelText(/scenario name/i), 'New Scenario');
      
      // Update phase name (required)
      const phaseNameInput = screen.getByDisplayValue('Phase 1');
      await user.clear(phaseNameInput);
      await user.type(phaseNameInput, 'My Phase');
      
      // Submit
      await user.click(screen.getByRole('button', { name: /save scenario/i }));
      
      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalled();
      });
      
      const submittedData = defaultProps.onSubmit.mock.calls[0][0];
      expect(submittedData.name).toBe('New Scenario');
      expect(submittedData.phases).toHaveLength(1);
      expect(submittedData.phases[0].name).toBe('My Phase');
    });

    it('validates required scenario name', async () => {
      const user = userEvent.setup();
      render(<ScenarioForm {...defaultProps} />);
      
      // Update phase name first
      const phaseNameInput = screen.getByDisplayValue('Phase 1');
      await user.clear(phaseNameInput);
      await user.type(phaseNameInput, 'Valid Phase');
      
      // Try to submit without scenario name
      await user.click(screen.getByRole('button', { name: /save scenario/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/scenario name is required/i)).toBeInTheDocument();
      });
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('validates required phase name', async () => {
      const user = userEvent.setup();
      render(<ScenarioForm {...defaultProps} />);
      
      // Fill scenario name
      await user.type(screen.getByLabelText(/scenario name/i), 'Test');
      
      // Clear phase name
      const phaseNameInput = screen.getByDisplayValue('Phase 1');
      await user.clear(phaseNameInput);
      
      // Submit
      await user.click(screen.getByRole('button', { name: /save scenario/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Button', () => {
    it('calls onCancel when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<ScenarioForm {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('Submitting State', () => {
    it('disables buttons when isSubmitting is true', () => {
      render(<ScenarioForm {...defaultProps} isSubmitting={true} />);
      
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });

    it('shows "Saving..." text when submitting', () => {
      render(<ScenarioForm {...defaultProps} isSubmitting={true} />);
      
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Custom Submit Label', () => {
    it('uses custom submit label', () => {
      render(<ScenarioForm {...defaultProps} submitLabel="Create Scenario" />);
      
      expect(screen.getByRole('button', { name: /create scenario/i })).toBeInTheDocument();
    });
  });

  describe('Load Profile Visualization', () => {
    it('renders load preview section', () => {
      render(<ScenarioForm {...defaultProps} />);
      expect(screen.getByText('Load Preview')).toBeInTheDocument();
    });

    it('renders phase timeline section', () => {
      render(<ScenarioForm {...defaultProps} />);
      expect(screen.getByText('Phase Timeline')).toBeInTheDocument();
    });
  });
});
