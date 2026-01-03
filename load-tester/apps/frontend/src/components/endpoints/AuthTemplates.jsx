import { useState, useRef, useEffect } from 'react';

const AUTH_TEMPLATES = [
  {
    id: 'bearer',
    name: 'Bearer Token',
    description: 'Authorization with Bearer token',
    icon: '🔑',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN_HERE',
      'Content-Type': 'application/json'
    },
  },
  {
    id: 'basic',
    name: 'Basic Auth',
    description: 'HTTP Basic Authentication',
    icon: '🔐',
    headers: {
      'Authorization': 'Basic YOUR_BASE64_CREDENTIALS',
      'Content-Type': 'application/json'
    },
  },
  {
    id: 'apikey-header',
    name: 'API Key (Header)',
    description: 'API Key in custom header',
    icon: '🗝️',
    headers: {
      'X-API-Key': 'YOUR_API_KEY_HERE',
      'Content-Type': 'application/json'
    },
  },
  {
    id: 'apikey-query',
    name: 'API Key (Query)',
    description: 'API Key as query parameter',
    icon: '🔓',
    note: 'Add ?api_key=YOUR_KEY to URL',
    headers: {
      'Content-Type': 'application/json'
    },
  },
  {
    id: 'oauth2',
    name: 'OAuth 2.0',
    description: 'OAuth 2.0 Bearer token',
    icon: '🎫',
    headers: {
      'Authorization': 'Bearer YOUR_OAUTH_TOKEN',
      'Content-Type': 'application/json'
    },
  },
  {
    id: 'jwt',
    name: 'JWT Token',
    description: 'JSON Web Token authentication',
    icon: '📝',
    headers: {
      'Authorization': 'Bearer YOUR_JWT_TOKEN',
      'Content-Type': 'application/json'
    },
  },
];

export const AuthTemplates = ({ onApplyTemplate }) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const triggerRef = useRef(null);

  // Handle Escape key to close panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showTemplates) {
        setShowTemplates(false);
        // Restore focus to trigger button
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showTemplates]);

  const handleApplyTemplate = (template) => {
    onApplyTemplate(template.headers, template.note);
    setShowTemplates(false);
    // Restore focus to trigger button
    triggerRef.current?.focus();
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setShowTemplates(!showTemplates)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span>🔒</span>
        <span>Auth Templates</span>
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
            <h3 className="text-sm font-semibold text-gray-900">Authentication Templates</h3>
            <p className="text-xs text-gray-600 mt-1">Select a template to populate headers</p>
          </div>

          <div className="p-2">
            {AUTH_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleApplyTemplate(template)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                        {template.name}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{template.description}</p>
                    
                    {template.note && (
                      <div className="mt-2 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        💡 {template.note}
                      </div>
                    )}

                    <div className="mt-2 bg-gray-50 rounded p-2">
                      <p className="text-xs font-mono text-gray-700">
                        {JSON.stringify(template.headers, null, 2)}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">💡 Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Replace placeholder values with your actual credentials</li>
                <li>Basic Auth: Use base64 encode of "username:password"</li>
                <li>Keep sensitive tokens secure and rotate regularly</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthTemplates;
