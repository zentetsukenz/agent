import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhaseEditor } from './PhaseEditor';

// Mock phase data
const mockPhase = {
  name: 'Test Phase',
  duration: 60,
  connections: 50,
  type: 'constant',
};

describe('PhaseEditor', () => {
  const defaultProps = {
    phase: mockPhase,
    index: 0,
    onChange: vi.fn(),
    onDelete: vi.fn(),
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    canMoveUp: true,
    canMoveDown: true,
    canDelete: true,
    errors: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders phase card with correct title', () => {
      render(<PhaseEditor {...defaultProps} />);
      expect(screen.getByText('Phase 1')).toBeInTheDocument();
    });

    it('renders name input with correct value', () => {
      render(<PhaseEditor {...defaultProps} />);
      const input = screen.getByLabelText(/name/i);
      expect(input).toHaveValue('Test Phase');
    });

    it('renders duration input with correct value', () => {
      render(<PhaseEditor {...defaultProps} />);
      const input = screen.getByLabelText(/duration/i);
      expect(input).toHaveValue(60);
    });

    it('renders connections input with correct value', () => {
      render(<PhaseEditor {...defaultProps} />);
      const input = screen.getByLabelText(/connections/i);
      expect(input).toHaveValue(50);
    });

    it('renders type selector', () => {
      render(<PhaseEditor {...defaultProps} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Phase Index Display', () => {
    it('displays correct phase number', () => {
      render(<PhaseEditor {...defaultProps} index={2} />);
      expect(screen.getByText('Phase 3')).toBeInTheDocument();
    });
  });

  describe('Input Changes', () => {
    it('calls onChange when name is updated', async () => {
      const user = userEvent.setup();
      render(<PhaseEditor {...defaultProps} />);
      
      const input = screen.getByLabelText(/name/i);
      await user.clear(input);
      await user.type(input, 'New Name');
      
      expect(defaultProps.onChange).toHaveBeenCalled();
    });

    it('calls onChange when duration is updated', async () => {
      const user = userEvent.setup();
      render(<PhaseEditor {...defaultProps} />);
      
      const input = screen.getByLabelText(/duration/i);
      await user.clear(input);
      await user.type(input, '120');
      
      expect(defaultProps.onChange).toHaveBeenCalled();
    });

    it('calls onChange when connections is updated', async () => {
      const user = userEvent.setup();
      render(<PhaseEditor {...defaultProps} />);
      
      const input = screen.getByLabelText(/connections/i);
      await user.clear(input);
      await user.type(input, '100');
      
      expect(defaultProps.onChange).toHaveBeenCalled();
    });
  });

  describe('Action Buttons', () => {
    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<PhaseEditor {...defaultProps} />);
      
      const deleteButton = screen.getByTitle('Delete phase');
      await user.click(deleteButton);
      
      expect(defaultProps.onDelete).toHaveBeenCalled();
    });

    it('calls onMoveUp when move up button is clicked', async () => {
      const user = userEvent.setup();
      render(<PhaseEditor {...defaultProps} />);
      
      const moveUpButton = screen.getByTitle('Move up');
      await user.click(moveUpButton);
      
      expect(defaultProps.onMoveUp).toHaveBeenCalled();
    });

    it('calls onMoveDown when move down button is clicked', async () => {
      const user = userEvent.setup();
      render(<PhaseEditor {...defaultProps} />);
      
      const moveDownButton = screen.getByTitle('Move down');
      await user.click(moveDownButton);
      
      expect(defaultProps.onMoveDown).toHaveBeenCalled();
    });

    it('disables move up button when canMoveUp is false', () => {
      render(<PhaseEditor {...defaultProps} canMoveUp={false} />);
      const moveUpButton = screen.getByTitle('Move up');
      expect(moveUpButton).toBeDisabled();
    });

    it('disables move down button when canMoveDown is false', () => {
      render(<PhaseEditor {...defaultProps} canMoveDown={false} />);
      const moveDownButton = screen.getByTitle('Move down');
      expect(moveDownButton).toBeDisabled();
    });

    it('disables delete button when canDelete is false', () => {
      render(<PhaseEditor {...defaultProps} canDelete={false} />);
      const deleteButton = screen.getByTitle('Delete phase');
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('Validation Errors', () => {
    it('displays name error when provided', () => {
      render(<PhaseEditor {...defaultProps} errors={{ name: 'Name is required' }} />);
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('displays duration error when provided', () => {
      render(<PhaseEditor {...defaultProps} errors={{ duration: 'Invalid duration' }} />);
      expect(screen.getByText('Invalid duration')).toBeInTheDocument();
    });

    it('displays connections error when provided', () => {
      render(<PhaseEditor {...defaultProps} errors={{ connections: 'Invalid connections' }} />);
      expect(screen.getByText('Invalid connections')).toBeInTheDocument();
    });
  });

  describe('Phase Type Descriptions', () => {
    it('shows ramp phase description', () => {
      render(<PhaseEditor {...defaultProps} phase={{ ...mockPhase, type: 'ramp' }} />);
      expect(screen.getByText(/gradually transition to 50 connections over 60s/i)).toBeInTheDocument();
    });

    it('shows constant phase description', () => {
      render(<PhaseEditor {...defaultProps} phase={{ ...mockPhase, type: 'constant' }} />);
      expect(screen.getByText(/maintain 50 connections for 60s/i)).toBeInTheDocument();
    });

    it('shows spike phase description', () => {
      render(<PhaseEditor {...defaultProps} phase={{ ...mockPhase, type: 'spike' }} />);
      expect(screen.getByText(/spike to 50 connections, then maintain for 60s/i)).toBeInTheDocument();
    });
  });

  describe('Phase Type Colors', () => {
    it('applies blue border for ramp type', () => {
      const { container } = render(
        <PhaseEditor {...defaultProps} phase={{ ...mockPhase, type: 'ramp' }} />
      );
      // The Card should have border-l-blue-500 class
      const card = container.querySelector('.border-l-blue-500');
      expect(card).toBeInTheDocument();
    });

    it('applies green border for constant type', () => {
      const { container } = render(
        <PhaseEditor {...defaultProps} phase={{ ...mockPhase, type: 'constant' }} />
      );
      const card = container.querySelector('.border-l-green-500');
      expect(card).toBeInTheDocument();
    });

    it('applies orange border for spike type', () => {
      const { container } = render(
        <PhaseEditor {...defaultProps} phase={{ ...mockPhase, type: 'spike' }} />
      );
      const card = container.querySelector('.border-l-orange-500');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Label Changes for Ramp Type', () => {
    it('shows "Target Connections" label for ramp type', () => {
      render(<PhaseEditor {...defaultProps} phase={{ ...mockPhase, type: 'ramp' }} />);
      expect(screen.getByLabelText(/target connections/i)).toBeInTheDocument();
    });

    it('shows "Connections" label for constant type', () => {
      render(<PhaseEditor {...defaultProps} phase={{ ...mockPhase, type: 'constant' }} />);
      const label = screen.getByText(/^connections \*$/i);
      expect(label).toBeInTheDocument();
    });
  });
});
