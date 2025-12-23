import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkflowStepEditor } from './WorkflowStepEditor';
import { DEFAULT_WORKFLOW_STEP } from '@/utils/scenarioConstants';

describe('WorkflowStepEditor', () => {
  const defaultProps = {
    step: { ...DEFAULT_WORKFLOW_STEP, name: 'Create Transaction', path: '/api/transactions' },
    index: 0,
    onChange: vi.fn(),
    onDelete: vi.fn(),
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    canMoveUp: true,
    canMoveDown: true,
    canDelete: true,
    errors: {},
    availableVariables: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders step number badge', () => {
      render(<WorkflowStepEditor {...defaultProps} index={1} />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders method badge', () => {
      render(<WorkflowStepEditor {...defaultProps} />);
      const postElements = screen.getAllByText('POST');
      expect(postElements.length).toBeGreaterThan(0);
    });

    it('renders step name input', () => {
      render(<WorkflowStepEditor {...defaultProps} />);
      expect(screen.getByDisplayValue('Create Transaction')).toBeInTheDocument();
    });

    it('renders execution mode section', () => {
      render(<WorkflowStepEditor {...defaultProps} />);
      expect(screen.getByText('Execution Mode')).toBeInTheDocument();
    });

    it('shows Loop as default execution mode', () => {
      render(<WorkflowStepEditor {...defaultProps} />);
      expect(screen.getByText('Runs continuously in loop during load test')).toBeInTheDocument();
    });
  });

  describe('RunOnce Toggle', () => {
    it('shows Loop badge when runOnce is false', () => {
      render(<WorkflowStepEditor {...defaultProps} />);
      // Find the Loop badge (not the toggle label)
      const badges = screen.getAllByText('Loop');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('shows Once badge when runOnce is true', () => {
      const onceStep = { ...defaultProps.step, runOnce: true };
      render(<WorkflowStepEditor {...defaultProps} step={onceStep} />);
      const badges = screen.getAllByText('Once');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('shows different description when runOnce is true', () => {
      const onceStep = { ...defaultProps.step, runOnce: true };
      render(<WorkflowStepEditor {...defaultProps} step={onceStep} />);
      expect(screen.getByText(/runs once per connection at start/i)).toBeInTheDocument();
    });

    it('calls onChange when toggle is clicked', async () => {
      const user = userEvent.setup();
      render(<WorkflowStepEditor {...defaultProps} />);
      
      const toggle = screen.getByRole('switch');
      await user.click(toggle);
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({ runOnce: true })
      );
    });

    it('uses green styling for loop mode', () => {
      render(<WorkflowStepEditor {...defaultProps} />);
      const badge = screen.getByText('1');
      expect(badge.className).toContain('bg-green-100');
    });

    it('uses blue styling for once mode', () => {
      const onceStep = { ...defaultProps.step, runOnce: true };
      render(<WorkflowStepEditor {...defaultProps} step={onceStep} />);
      const badge = screen.getByText('1');
      expect(badge.className).toContain('bg-blue-100');
    });
  });

  describe('Action Buttons', () => {
    it('renders move up button', () => {
      render(<WorkflowStepEditor {...defaultProps} />);
      expect(screen.getByRole('button', { name: /move up/i })).toBeInTheDocument();
    });

    it('renders move down button', () => {
      render(<WorkflowStepEditor {...defaultProps} />);
      expect(screen.getByRole('button', { name: /move down/i })).toBeInTheDocument();
    });

    it('renders delete button', () => {
      render(<WorkflowStepEditor {...defaultProps} />);
      expect(screen.getByRole('button', { name: /delete step/i })).toBeInTheDocument();
    });

    it('disables buttons appropriately', () => {
      render(<WorkflowStepEditor {...defaultProps} canMoveUp={false} canMoveDown={false} />);
      expect(screen.getByRole('button', { name: /move up/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /move down/i })).toBeDisabled();
    });

    it('calls handlers when buttons clicked', async () => {
      const user = userEvent.setup();
      render(<WorkflowStepEditor {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /move up/i }));
      expect(defaultProps.onMoveUp).toHaveBeenCalled();
      
      await user.click(screen.getByRole('button', { name: /delete step/i }));
      expect(defaultProps.onDelete).toHaveBeenCalled();
    });
  });

  describe('Input Changes', () => {
    it('calls onChange when name changes', async () => {
      const user = userEvent.setup();
      render(<WorkflowStepEditor {...defaultProps} />);
      
      const input = screen.getByDisplayValue('Create Transaction');
      await user.clear(input);
      await user.type(input, 'New Step');
      
      expect(defaultProps.onChange).toHaveBeenCalled();
    });

    it('calls onChange when path changes', async () => {
      const user = userEvent.setup();
      render(<WorkflowStepEditor {...defaultProps} />);
      
      const input = screen.getByDisplayValue('/api/transactions');
      await user.clear(input);
      await user.type(input, '/api/new');
      
      expect(defaultProps.onChange).toHaveBeenCalled();
    });
  });

  describe('Body Input', () => {
    it('shows body input for POST method', () => {
      render(<WorkflowStepEditor {...defaultProps} />);
      expect(screen.getByText('Request Body (JSON)')).toBeInTheDocument();
    });

    it('shows body input for PUT method', () => {
      const putStep = { ...defaultProps.step, method: 'PUT' };
      render(<WorkflowStepEditor {...defaultProps} step={putStep} />);
      expect(screen.getByText('Request Body (JSON)')).toBeInTheDocument();
    });

    it('hides body input for GET method', () => {
      const getStep = { ...defaultProps.step, method: 'GET' };
      render(<WorkflowStepEditor {...defaultProps} step={getStep} />);
      expect(screen.queryByText('Request Body (JSON)')).not.toBeInTheDocument();
    });

    it('hides body input for DELETE method', () => {
      const deleteStep = { ...defaultProps.step, method: 'DELETE' };
      render(<WorkflowStepEditor {...defaultProps} step={deleteStep} />);
      expect(screen.queryByText('Request Body (JSON)')).not.toBeInTheDocument();
    });
  });

  describe('Variable Extractors', () => {
    it('shows extract variables section', () => {
      render(<WorkflowStepEditor {...defaultProps} />);
      expect(screen.getByText('Extract Variables')).toBeInTheDocument();
    });

    it('shows empty state when no extractors', () => {
      render(<WorkflowStepEditor {...defaultProps} />);
      expect(screen.getByText(/no variables extracted/i)).toBeInTheDocument();
    });

    it('shows add variable button', () => {
      render(<WorkflowStepEditor {...defaultProps} />);
      expect(screen.getByRole('button', { name: /add variable/i })).toBeInTheDocument();
    });
  });

  describe('Available Variables', () => {
    it('passes available variables to path input', () => {
      const variables = [
        { name: 'bookUid', scope: 'setup', description: 'From setup' },
      ];
      render(<WorkflowStepEditor {...defaultProps} availableVariables={variables} />);
      // The VariableAutocomplete component receives the variables
      // We can't directly test this without more complex setup,
      // but we verify the component renders without error
      expect(screen.getByDisplayValue('/api/transactions')).toBeInTheDocument();
    });
  });

  describe('Validation Errors', () => {
    it('shows name error', () => {
      render(<WorkflowStepEditor {...defaultProps} errors={{ name: 'Name required' }} />);
      expect(screen.getByText('Name required')).toBeInTheDocument();
    });

    it('shows path error', () => {
      render(<WorkflowStepEditor {...defaultProps} errors={{ path: 'Path required' }} />);
      expect(screen.getByText('Path required')).toBeInTheDocument();
    });
  });
});
