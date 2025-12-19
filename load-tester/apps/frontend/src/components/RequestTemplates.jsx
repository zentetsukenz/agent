import { useState } from 'react';

const TEMPLATES = [
  {
    id: 'light',
    name: 'Light Load',
    description: 'Low traffic simulation',
    icon: '🟢',
    config: {
      duration: 60,
      connections: 10,
      rps: '',
      timeout: 300,
    },
  },
  {
    id: 'medium',
    name: 'Medium Load',
    description: 'Moderate traffic test',
    icon: '🟡',
    config: {
      duration: 120,
      connections: 50,
      rps: '',
      timeout: 300,
    },
  },
  {
    id: 'heavy',
    name: 'Heavy Load',
    description: 'High traffic stress test',
    icon: '🟠',
    config: {
      duration: 300,
      connections: 200,
      rps: '',
      timeout: 600,
    },
  },
  {
    id: 'stress',
    name: 'Stress Test',
    description: 'Maximum load capacity test',
    icon: '🔴',
    config: {
      duration: 180,
      connections: 500,
      rps: 5000,
      timeout: 600,
    },
  },
];

export default function RequestTemplates({ onApplyTemplate }) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [customTemplates, setCustomTemplates] = useState(() => {
    const saved = localStorage.getItem('load-tester-templates');
    return saved ? JSON.parse(saved) : [];
  });

  const handleApplyTemplate = (template) => {
    onApplyTemplate(template.config);
    setShowTemplates(false);
  };

  // eslint-disable-next-line no-unused-vars
  const saveCustomTemplate = (name, config) => {
    const newTemplate = {
      id: `custom-${Date.now()}`,
      name,
      description: 'Custom template',
      icon: '⭐',
      config,
      custom: true,
    };
    
    const updated = [...customTemplates, newTemplate];
    setCustomTemplates(updated);
    localStorage.setItem('load-tester-templates', JSON.stringify(updated));
  };

  const deleteCustomTemplate = (id) => {
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem('load-tester-templates', JSON.stringify(updated));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowTemplates(!showTemplates)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span>📋</span>
        <span>Quick Templates</span>
        <svg
          className={`w-4 h-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showTemplates && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Predefined Templates</h3>
          </div>

          <div className="p-2">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleApplyTemplate(template)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-start gap-3 group"
              >
                <span className="text-2xl">{template.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                      {template.name}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {template.config.duration}s / {template.config.connections} conn
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{template.description}</p>
                  <div className="flex gap-2 mt-2 text-xs text-gray-500">
                    <span>Duration: {template.config.duration}s</span>
                    <span>•</span>
                    <span>Connections: {template.config.connections}</span>
                    {template.config.rps && (
                      <>
                        <span>•</span>
                        <span>RPS: {template.config.rps}</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {customTemplates.length > 0 && (
            <>
              <div className="p-3 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Custom Templates</h3>
              </div>
              <div className="p-2">
                {customTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <button
                      onClick={() => handleApplyTemplate(template)}
                      className="flex-1 text-left flex items-start gap-3"
                    >
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <div className="flex gap-2 mt-1 text-xs text-gray-500">
                          <span>{template.config.duration}s</span>
                          <span>•</span>
                          <span>{template.config.connections} conn</span>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => deleteCustomTemplate(template.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete template"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
