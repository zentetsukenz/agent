import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ScenarioInfoCard } from './ScenarioInfoCard';

// Wrapper with router context
const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

// Mock scenario data
const mockStandardScenario = {
  id: 1,
  name: 'Load Test',
  type: 'standard',
  description: 'Standard load testing scenario',
  phases: JSON.stringify([
    { name: 'Ramp Up', duration: 30, connections: 50, type: 'ramp' },
    { name: 'Sustain', duration: 120, connections: 100, type: 'constant' },
    { name: 'Ramp Down', duration: 30, connections: 50, type: 'ramp' },
  ]),
};

const mockWorkflowScenario = {
  id: 2,
  name: 'Workflow Test',
  type: 'workflow',
  description: 'Multi-step workflow test',
  phases: JSON.stringify([
    { name: 'Load', duration: 60, connections: 50, type: 'constant' },
  ]),
  workflowSteps: JSON.stringify([
    { type: 'request', method: 'GET', path: '/api/users' },
    { type: 'request', method: 'POST', path: '/api/orders' },
    { type: 'request', method: 'GET', path: '/api/orders/{{orderId}}' },
  ]),
};

const mockScenarioNoDescription = {
  id: 3,
  name: 'Simple Test',
  type: 'standard',
  phases: JSON.stringify([
    { name: 'Test', duration: 30, connections: 10, type: 'constant' },
  ]),
};

describe('ScenarioInfoCard', () => {
  describe('Basic Rendering', () => {
    it('renders scenario info card with correct title', () => {
      renderWithRouter(<ScenarioInfoCard scenario={mockStandardScenario} />);
      
      expect(screen.getByText('Scenario Used')).toBeInTheDocument();
    });

    it('renders scenario name as link', () => {
      renderWithRouter(<ScenarioInfoCard scenario={mockStandardScenario} />);
      
      const nameLink = screen.getByRole('link', { name: /load test/i });
      expect(nameLink).toBeInTheDocument();
      expect(nameLink).toHaveAttribute('href', '/scenarios/1');
    });

    it('renders description when present', () => {
      renderWithRouter(<ScenarioInfoCard scenario={mockStandardScenario} />);
      
      expect(screen.getByText('Standard load testing scenario')).toBeInTheDocument();
    });

    it('does not render description when absent', () => {
      renderWithRouter(<ScenarioInfoCard scenario={mockScenarioNoDescription} />);
      
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });
  });

  describe('Scenario Type Badge', () => {
    it('displays Standard badge for standard scenarios', () => {
      renderWithRouter(<ScenarioInfoCard scenario={mockStandardScenario} />);
      
      expect(screen.getByText('Standard')).toBeInTheDocument();
    });

    it('displays Workflow badge for workflow scenarios', () => {
      renderWithRouter(<ScenarioInfoCard scenario={mockWorkflowScenario} />);
      
      expect(screen.getByText('Workflow')).toBeInTheDocument();
    });
  });

  describe('Phase Count Display', () => {
    it('displays correct phase count for standard scenario', () => {
      renderWithRouter(<ScenarioInfoCard scenario={mockStandardScenario} />);
      
      expect(screen.getByText('3 phases')).toBeInTheDocument();
    });

    it('displays singular "phase" for single phase', () => {
      renderWithRouter(<ScenarioInfoCard scenario={mockWorkflowScenario} />);
      
      expect(screen.getByText('1 phase')).toBeInTheDocument();
    });
  });

  describe('Workflow Steps Display', () => {
    it('displays workflow steps count for workflow scenarios', () => {
      renderWithRouter(<ScenarioInfoCard scenario={mockWorkflowScenario} />);
      
      expect(screen.getByText('3 steps')).toBeInTheDocument();
    });

    it('does not display workflow steps for standard scenarios', () => {
      renderWithRouter(<ScenarioInfoCard scenario={mockStandardScenario} />);
      
      expect(screen.queryByText('Workflow Steps')).not.toBeInTheDocument();
    });
  });

  describe('Null/Empty Handling', () => {
    it('returns null when scenario is null', () => {
      const { container } = renderWithRouter(<ScenarioInfoCard scenario={null} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('returns null when scenario is undefined', () => {
      const { container } = renderWithRouter(<ScenarioInfoCard scenario={undefined} />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Data Test IDs', () => {
    it('renders scenario-info-card test id', () => {
      renderWithRouter(<ScenarioInfoCard scenario={mockStandardScenario} />);
      
      expect(screen.getByTestId('scenario-info-card')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles scenario with phases as array (not JSON string)', () => {
      const scenarioWithArrayPhases = {
        ...mockStandardScenario,
        phases: [
          { name: 'Phase 1', duration: 30, connections: 10 },
          { name: 'Phase 2', duration: 60, connections: 20 },
        ],
      };
      
      renderWithRouter(<ScenarioInfoCard scenario={scenarioWithArrayPhases} />);
      
      expect(screen.getByText('2 phases')).toBeInTheDocument();
    });

    it('handles invalid JSON phases gracefully', () => {
      const scenarioWithInvalidPhases = {
        ...mockStandardScenario,
        phases: 'invalid json',
      };
      
      renderWithRouter(<ScenarioInfoCard scenario={scenarioWithInvalidPhases} />);
      
      // Should show N/A for invalid JSON
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('handles workflow scenario with steps as array (not JSON string)', () => {
      const scenarioWithArraySteps = {
        ...mockWorkflowScenario,
        workflowSteps: [
          { type: 'request', method: 'GET', path: '/api/test' },
        ],
      };
      
      renderWithRouter(<ScenarioInfoCard scenario={scenarioWithArraySteps} />);
      
      expect(screen.getByText('1 step')).toBeInTheDocument();
    });

    it('handles workflow with invalid JSON steps gracefully', () => {
      const scenarioWithInvalidSteps = {
        ...mockWorkflowScenario,
        workflowSteps: 'invalid json',
      };
      
      renderWithRouter(<ScenarioInfoCard scenario={scenarioWithInvalidSteps} />);
      
      // Should show N/A for invalid JSON
      expect(screen.getAllByText('N/A')).toHaveLength(1);
    });
  });
});
