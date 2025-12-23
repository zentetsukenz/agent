import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VariableExtractor } from './VariableExtractor';

describe('VariableExtractor', () => {
  const defaultProps = {
    extractors: [],
    onChange: vi.fn(),
    errors: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    it('renders section header', () => {
      render(<VariableExtractor {...defaultProps} />);
      expect(screen.getByText('Extract Variables')).toBeInTheDocument();
    });

    it('renders add variable button', () => {
      render(<VariableExtractor {...defaultProps} />);
      expect(screen.getByRole('button', { name: /add variable/i })).toBeInTheDocument();
    });

    it('shows empty state message', () => {
      render(<VariableExtractor {...defaultProps} />);
      expect(screen.getByText(/no variables extracted/i)).toBeInTheDocument();
    });
  });

  describe('Adding Variables', () => {
    it('calls onChange with new extractor when add clicked', async () => {
      const user = userEvent.setup();
      render(<VariableExtractor {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /add variable/i }));
      
      expect(defaultProps.onChange).toHaveBeenCalledWith([
        { name: '', source: 'body', path: '' }
      ]);
    });
  });

  describe('With Extractors', () => {
    const extractors = [
      { name: 'bookUid', source: 'body', path: 'uid' },
      { name: 'token', source: 'header', path: 'Authorization' },
    ];

    it('renders all extractors', () => {
      render(<VariableExtractor {...defaultProps} extractors={extractors} />);
      expect(screen.getByDisplayValue('bookUid')).toBeInTheDocument();
      expect(screen.getByDisplayValue('token')).toBeInTheDocument();
    });

    it('renders variable name inputs', () => {
      render(<VariableExtractor {...defaultProps} extractors={extractors} />);
      expect(screen.getByDisplayValue('bookUid')).toBeInTheDocument();
      expect(screen.getByDisplayValue('token')).toBeInTheDocument();
    });

    it('renders path inputs', () => {
      render(<VariableExtractor {...defaultProps} extractors={extractors} />);
      expect(screen.getByDisplayValue('uid')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Authorization')).toBeInTheDocument();
    });

    it('renders source selectors', () => {
      render(<VariableExtractor {...defaultProps} extractors={extractors} />);
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBe(2);
    });

    it('renders delete buttons for each extractor', () => {
      render(<VariableExtractor {...defaultProps} extractors={extractors} />);
      const deleteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('svg')
      );
      // Should have delete buttons (excluding add button)
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('shows help text about variable syntax', () => {
      render(<VariableExtractor {...defaultProps} extractors={extractors} />);
      expect(screen.getByText(/can be used in subsequent steps/i)).toBeInTheDocument();
    });
  });

  describe('Updating Extractors', () => {
    const extractors = [{ name: 'testVar', source: 'body', path: 'data' }];

    it('calls onChange when variable name changes', async () => {
      const user = userEvent.setup();
      render(<VariableExtractor {...defaultProps} extractors={extractors} />);
      
      const input = screen.getByDisplayValue('testVar');
      await user.type(input, 'X');
      
      expect(defaultProps.onChange).toHaveBeenCalled();
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0];
      expect(lastCall[0].name).toBe('testVarX');
    });

    it('calls onChange when path changes', async () => {
      const user = userEvent.setup();
      render(<VariableExtractor {...defaultProps} extractors={extractors} />);
      
      const input = screen.getByDisplayValue('data');
      await user.clear(input);
      await user.type(input, 'items[0].id');
      
      expect(defaultProps.onChange).toHaveBeenCalled();
    });
  });

  describe('Removing Extractors', () => {
    it('calls onChange without removed extractor', async () => {
      const user = userEvent.setup();
      const extractors = [
        { name: 'var1', source: 'body', path: 'a' },
        { name: 'var2', source: 'body', path: 'b' },
      ];
      render(<VariableExtractor {...defaultProps} extractors={extractors} />);
      
      // Find the delete buttons (they have Trash2 icons)
      const allButtons = screen.getAllByRole('button');
      const deleteButtons = allButtons.filter(btn => 
        btn.className.includes('hover:text-destructive')
      );
      
      await user.click(deleteButtons[0]);
      
      expect(defaultProps.onChange).toHaveBeenCalledWith([
        { name: 'var2', source: 'body', path: 'b' }
      ]);
    });
  });

  describe('Source-specific Labels', () => {
    it('shows JSONata Path label for body source', () => {
      const extractors = [{ name: 'test', source: 'body', path: '' }];
      render(<VariableExtractor {...defaultProps} extractors={extractors} />);
      expect(screen.getByText('JSONata Path')).toBeInTheDocument();
    });

    it('shows Name label for header source', () => {
      const extractors = [{ name: 'test', source: 'header', path: '' }];
      render(<VariableExtractor {...defaultProps} extractors={extractors} />);
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('shows Name label for cookie source', () => {
      const extractors = [{ name: 'test', source: 'cookie', path: '' }];
      render(<VariableExtractor {...defaultProps} extractors={extractors} />);
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  describe('Validation Errors', () => {
    it('shows name error for specific extractor', () => {
      const extractors = [{ name: '', source: 'body', path: '' }];
      const errors = { 0: { name: 'Variable name is required' } };
      render(<VariableExtractor {...defaultProps} extractors={extractors} errors={errors} />);
      expect(screen.getByText('Variable name is required')).toBeInTheDocument();
    });

    it('shows path error for specific extractor', () => {
      const extractors = [{ name: 'test', source: 'body', path: '' }];
      const errors = { 0: { path: 'Path is required' } };
      render(<VariableExtractor {...defaultProps} extractors={extractors} errors={errors} />);
      expect(screen.getByText('Path is required')).toBeInTheDocument();
    });

    it('applies error styling to inputs', () => {
      const extractors = [{ name: '', source: 'body', path: '' }];
      const errors = { 0: { name: 'Required' } };
      render(<VariableExtractor {...defaultProps} extractors={extractors} errors={errors} />);
      
      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0].className).toContain('border-destructive');
    });
  });
});
