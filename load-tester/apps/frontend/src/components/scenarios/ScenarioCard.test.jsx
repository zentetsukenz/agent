import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ScenarioCard } from './ScenarioCard';

// Mock scenario data
const mockTemplateScenario = {
  id: 1,
  name: 'Smoke Test',
  description: 'Minimal load to verify endpoint works correctly.',
  isTemplate: true,
  executionMode: 'simple',
  phases: [
    { name: 'Smoke', duration: 60, connections: 2, type: 'constant' }
  ],
};

const mockCustomScenario = {
  id: 100,
  name: 'My Custom Test',
  description: 'A custom test configuration.',
  isTemplate: false,
  executionMode: 'workflow',
  phases: [
    { name: 'Ramp Up', duration: 30, connections: 50, type: 'ramp', targetConnections: 50 },
    { name: 'Sustain', duration: 120, connections: 50, type: 'constant' },
    { name: 'Cool Down', duration: 30, connections: 50, targetConnections: 0, type: 'ramp' }
  ],
};

// Wrapper with router context
const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('ScenarioCard', () => {
  describe('Basic Rendering', () => {
    it('renders scenario name as link', () => {
      renderWithRouter(<ScenarioCard scenario={mockTemplateScenario} />);
      
      const nameLink = screen.getByRole('link', { name: /smoke test/i });
      expect(nameLink).toBeInTheDocument();
      expect(nameLink).toHaveAttribute('href', '/scenarios/1');
    });

    it('renders scenario description', () => {
      renderWithRouter(<ScenarioCard scenario={mockTemplateScenario} />);
      
      expect(screen.getByText(/minimal load to verify endpoint/i)).toBeInTheDocument();
    });

    it('renders template badge for templates', () => {
      renderWithRouter(<ScenarioCard scenario={mockTemplateScenario} />);
      
      expect(screen.getByText('Template')).toBeInTheDocument();
    });

    it('does not render template badge for custom scenarios', () => {
      renderWithRouter(<ScenarioCard scenario={mockCustomScenario} />);
      
      expect(screen.queryByText('Template')).not.toBeInTheDocument();
    });
  });

  describe('Stats Display', () => {
    it('displays total duration correctly', () => {
      renderWithRouter(<ScenarioCard scenario={mockTemplateScenario} />);
      
      // 60 seconds = 1m 0s
      expect(screen.getByText('1m 0s')).toBeInTheDocument();
    });

    it('displays max connections with suffix', () => {
      renderWithRouter(<ScenarioCard scenario={mockTemplateScenario} />);
      
      expect(screen.getByText('2 max')).toBeInTheDocument();
    });

    it('displays phase count with suffix', () => {
      renderWithRouter(<ScenarioCard scenario={mockCustomScenario} />);
      
      // 3 phases
      expect(screen.getByText('3 phases')).toBeInTheDocument();
    });

    it('calculates duration for multi-phase scenarios', () => {
      renderWithRouter(<ScenarioCard scenario={mockCustomScenario} />);
      
      // 30 + 120 + 30 = 180 seconds = 3m 0s
      expect(screen.getByText('3m 0s')).toBeInTheDocument();
    });

    it('displays max connections from all phases', () => {
      renderWithRouter(<ScenarioCard scenario={mockCustomScenario} />);
      
      // Max is 50
      expect(screen.getByText('50 max')).toBeInTheDocument();
    });
  });

  describe('Phase Labels', () => {
    it('displays phase labels', () => {
      renderWithRouter(<ScenarioCard scenario={mockTemplateScenario} />);
      
      expect(screen.getByText('Smoke')).toBeInTheDocument();
    });

    it('truncates when more than 4 phases', () => {
      const manyPhases = {
        ...mockCustomScenario,
        phases: [
          { name: 'Phase 1', duration: 30, connections: 10, type: 'constant' },
          { name: 'Phase 2', duration: 30, connections: 20, type: 'constant' },
          { name: 'Phase 3', duration: 30, connections: 30, type: 'constant' },
          { name: 'Phase 4', duration: 30, connections: 40, type: 'constant' },
          { name: 'Phase 5', duration: 30, connections: 50, type: 'constant' },
        ],
      };
      
      renderWithRouter(<ScenarioCard scenario={manyPhases} />);
      
      expect(screen.getByText('Phase 1')).toBeInTheDocument();
      expect(screen.getByText('Phase 2')).toBeInTheDocument();
      expect(screen.getByText('Phase 3')).toBeInTheDocument();
      expect(screen.getByText('Phase 4')).toBeInTheDocument();
      expect(screen.getByText('+1 more')).toBeInTheDocument();
      expect(screen.queryByText('Phase 5')).not.toBeInTheDocument();
    });
  });

  describe('Mini Load Profile', () => {
    it('renders SVG visualization', () => {
      const { container } = renderWithRouter(<ScenarioCard scenario={mockTemplateScenario} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Actions - Templates', () => {
    it('shows View and Duplicate buttons for templates', () => {
      renderWithRouter(<ScenarioCard scenario={mockTemplateScenario} />);
      
      expect(screen.getByRole('link', { name: /view/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /duplicate/i })).toBeInTheDocument();
    });

    it('does not show Edit or Delete for templates', () => {
      renderWithRouter(<ScenarioCard scenario={mockTemplateScenario} />);
      
      expect(screen.queryByRole('link', { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });

    it('calls onDuplicate when Duplicate clicked', async () => {
      const user = userEvent.setup();
      const onDuplicate = vi.fn();
      
      renderWithRouter(
        <ScenarioCard scenario={mockTemplateScenario} onDuplicate={onDuplicate} />
      );
      
      await user.click(screen.getByRole('button', { name: /duplicate/i }));
      
      expect(onDuplicate).toHaveBeenCalledWith(1);
    });
  });

  describe('Actions - Custom Scenarios', () => {
    it('shows View, Edit, Duplicate buttons and Delete icon for custom scenarios', () => {
      const onDelete = vi.fn();
      renderWithRouter(
        <ScenarioCard scenario={mockCustomScenario} onDelete={onDelete} />
      );
      
      expect(screen.getByRole('link', { name: /view/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /duplicate/i })).toBeInTheDocument();
      // Delete button is icon-only, so check for buttons in the card
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2); // Duplicate + Delete
    });

    it('calls onDelete when Delete button clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      
      renderWithRouter(
        <ScenarioCard scenario={mockCustomScenario} onDelete={onDelete} />
      );
      
      // Find the delete button by its red color styling (it's icon-only)
      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(btn => 
        btn.className.includes('text-red')
      );
      
      expect(deleteButton).toBeTruthy();
      await user.click(deleteButton);
      
      expect(onDelete).toHaveBeenCalledWith(100, 'My Custom Test');
    });

    it('Edit links to correct route', () => {
      const onDelete = vi.fn();
      renderWithRouter(
        <ScenarioCard scenario={mockCustomScenario} onDelete={onDelete} />
      );
      
      const editLink = screen.getByRole('link', { name: /edit/i });
      expect(editLink).toHaveAttribute('href', '/scenarios/100/edit');
    });
  });

});
