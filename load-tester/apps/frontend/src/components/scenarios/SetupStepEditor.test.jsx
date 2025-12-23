import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SetupStepEditor } from './SetupStepEditor';
import { DEFAULT_SETUP_STEP } from '@/utils/scenarioConstants';

describe('SetupStepEditor', () => {
  const defaultProps = {
    step: { ...DEFAULT_SETUP_STEP, name: 'Create Book', path: '/api/books' },
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
    stepType: 'setup',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders step number badge', () => {
      render(<SetupStepEditor {...defaultProps} index={2} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders method badge', () => {
      render(<SetupStepEditor {...defaultProps} />);
      const postElements = screen.getAllByText('POST');
      expect(postElements.length).toBeGreaterThan(0);
    });

    it('renders step name input with value', () => {
      render(<SetupStepEditor {...defaultProps} />);
      const input = screen.getByDisplayValue('Create Book');
      expect(input).toBeInTheDocument();
    });

    it('renders method selector', () => {
      render(<SetupStepEditor {...defaultProps} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders path input', () => {
      render(<SetupStepEditor {...defaultProps} />);
      const pathInput = screen.getByDisplayValue('/api/books');
      expect(pathInput).toBeInTheDocument();
    });

    it('shows body input for POST method', () => {
      render(<SetupStepEditor {...defaultProps} />);
      expect(screen.getByText('Request Body (JSON)')).toBeInTheDocument();
    });

    it('hides body input for GET method', () => {
      const getStep = { ...defaultProps.step, method: 'GET' };
      render(<SetupStepEditor {...defaultProps} step={getStep} />);
      expect(screen.queryByText('Request Body (JSON)')).not.toBeInTheDocument();
    });

    it('renders Extract Variables section', () => {
      render(<SetupStepEditor {...defaultProps} />);
      expect(screen.getByText('Extract Variables')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add variable/i })).toBeInTheDocument();
    });

    it('renders Advanced Settings button', () => {
      render(<SetupStepEditor {...defaultProps} />);
      expect(screen.getByRole('button', { name: /advanced settings/i })).toBeInTheDocument();
    });
  });

  describe('Step Type Styling', () => {
    it('uses purple color for setup step', () => {
      render(<SetupStepEditor {...defaultProps} stepType="setup" />);
      const badge = screen.getByText('1');
      expect(badge.className).toContain('bg-purple-100');
    });

    it('uses gray color for teardown step', () => {
      render(<SetupStepEditor {...defaultProps} stepType="teardown" />);
      const badge = screen.getByText('1');
      expect(badge.className).toContain('bg-gray-100');
    });
  });

  describe('Action Buttons', () => {
    it('renders move up button', () => {
      render(<SetupStepEditor {...defaultProps} />);
      expect(screen.getByRole('button', { name: /move up/i })).toBeInTheDocument();
    });

    it('renders move down button', () => {
      render(<SetupStepEditor {...defaultProps} />);
      expect(screen.getByRole('button', { name: /move down/i })).toBeInTheDocument();
    });

    it('renders delete button', () => {
      render(<SetupStepEditor {...defaultProps} />);
      expect(screen.getByRole('button', { name: /delete step/i })).toBeInTheDocument();
    });

    it('disables move up when canMoveUp is false', () => {
      render(<SetupStepEditor {...defaultProps} canMoveUp={false} />);
      expect(screen.getByRole('button', { name: /move up/i })).toBeDisabled();
    });

    it('disables move down when canMoveDown is false', () => {
      render(<SetupStepEditor {...defaultProps} canMoveDown={false} />);
      expect(screen.getByRole('button', { name: /move down/i })).toBeDisabled();
    });

    it('disables delete when canDelete is false', () => {
      render(<SetupStepEditor {...defaultProps} canDelete={false} />);
      expect(screen.getByRole('button', { name: /delete step/i })).toBeDisabled();
    });

    it('calls onMoveUp when move up clicked', async () => {
      const user = userEvent.setup();
      render(<SetupStepEditor {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /move up/i }));
      expect(defaultProps.onMoveUp).toHaveBeenCalledTimes(1);
    });

    it('calls onMoveDown when move down clicked', async () => {
      const user = userEvent.setup();
      render(<SetupStepEditor {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /move down/i }));
      expect(defaultProps.onMoveDown).toHaveBeenCalledTimes(1);
    });

    it('calls onDelete when delete clicked', async () => {
      const user = userEvent.setup();
      render(<SetupStepEditor {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /delete step/i }));
      expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input Changes', () => {
    it('calls onChange when name changes', async () => {
      const user = userEvent.setup();
      render(<SetupStepEditor {...defaultProps} />);
      
      const input = screen.getByDisplayValue('Create Book');
      await user.type(input, 'X');
      
      expect(defaultProps.onChange).toHaveBeenCalled();
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0];
      expect(lastCall.name).toBe('Create BookX');
    });

    it('calls onChange when path changes', async () => {
      const user = userEvent.setup();
      render(<SetupStepEditor {...defaultProps} />);
      
      const input = screen.getByDisplayValue('/api/books');
      await user.clear(input);
      await user.type(input, '/api/new');
      
      expect(defaultProps.onChange).toHaveBeenCalled();
    });
  });

  describe('Validation Errors', () => {
    it('shows name error when provided', () => {
      render(<SetupStepEditor {...defaultProps} errors={{ name: 'Name is required' }} />);
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('shows path error when provided', () => {
      render(<SetupStepEditor {...defaultProps} errors={{ path: 'Path is required' }} />);
      expect(screen.getByText('Path is required')).toBeInTheDocument();
    });

    it('applies error styling to name input', () => {
      render(<SetupStepEditor {...defaultProps} errors={{ name: 'Required' }} />);
      const input = screen.getByDisplayValue('Create Book');
      expect(input.className).toContain('border-destructive');
    });
  });

  describe('Variable Extractors', () => {
    it('shows empty state when no extractors', () => {
      render(<SetupStepEditor {...defaultProps} />);
      expect(screen.getByText(/no variables extracted/i)).toBeInTheDocument();
    });

    it('renders existing extractors', () => {
      const stepWithExtractors = {
        ...defaultProps.step,
        extractors: [{ name: 'bookUid', source: 'body', path: 'uid' }],
      };
      render(<SetupStepEditor {...defaultProps} step={stepWithExtractors} />);
      expect(screen.getByDisplayValue('bookUid')).toBeInTheDocument();
      expect(screen.getByDisplayValue('uid')).toBeInTheDocument();
    });
  });

  describe('Advanced Settings', () => {
    it('toggles advanced settings visibility', async () => {
      const user = userEvent.setup();
      render(<SetupStepEditor {...defaultProps} />);
      
      // Initially collapsed - headers field not visible
      expect(screen.queryByText('Headers (JSON)')).not.toBeInTheDocument();
      
      // Click to expand
      await user.click(screen.getByRole('button', { name: /advanced settings/i }));
      
      // Now visible
      expect(screen.getByText('Headers (JSON)')).toBeInTheDocument();
    });
  });
});
