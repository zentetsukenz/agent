import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/**
 * VariableAutocomplete - Input with variable autocomplete on {{ trigger
 * 
 * @param {string} value - Current input value
 * @param {Function} onChange - Called with new value
 * @param {Array} variables - Available variables [{ name, scope, description }]
 * @param {boolean} multiline - Use textarea instead of input
 * @param {string} placeholder - Placeholder text
 * @param {string} className - Additional CSS classes
 * @param {Object} ...props - Additional props passed to input/textarea
 */
export const VariableAutocomplete = ({
  value = '',
  onChange,
  variables = [],
  multiline = false,
  placeholder,
  className,
  ...props
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter variables based on search term
  const filteredVariables = useMemo(() => 
    variables.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [variables, searchTerm]
  );

  // Helper to update search term and reset selection
  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);
    setSelectedIndex(0);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position based on cursor
  const calculateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;
    
    const input = inputRef.current;
    const rect = input.getBoundingClientRect();
    
    // For simplicity, position below the input
    // In a more sophisticated implementation, we'd calculate cursor position
    setDropdownPosition({
      top: rect.height + 4,
      left: 0,
    });
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    
    onChange(newValue);

    // Check for {{ trigger
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');
    const lastCloseBrace = textBeforeCursor.lastIndexOf('}}');

    // Show dropdown if we're inside {{ }} and haven't closed it
    if (lastOpenBrace > lastCloseBrace) {
      const searchText = textBeforeCursor.slice(lastOpenBrace + 2);
      // Only show if there's no space (user is typing variable name)
      if (!searchText.includes(' ') && !searchText.includes('\n')) {
        updateSearchTerm(searchText);
        setShowDropdown(true);
        calculateDropdownPosition();
      } else {
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || filteredVariables.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredVariables.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredVariables.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        if (showDropdown && filteredVariables[selectedIndex]) {
          e.preventDefault();
          insertVariable(filteredVariables[selectedIndex].name);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  // Insert variable at cursor position
  const insertVariable = (variableName) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');
    
    // Replace from {{ to cursor with {{variableName}}
    const newValue = 
      value.slice(0, lastOpenBrace) + 
      `{{${variableName}}}` + 
      value.slice(cursorPosition);
    
    onChange(newValue);
    setShowDropdown(false);
    
    // Focus back on input
    inputRef.current?.focus();
  };

  // Handle variable click
  const handleVariableClick = (variableName) => {
    insertVariable(variableName);
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="relative">
      <InputComponent
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        {...props}
      />
      
      {showDropdown && filteredVariables.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full max-h-48 overflow-auto bg-white border rounded-md shadow-lg"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
        >
          {filteredVariables.map((variable, index) => (
            <button
              key={variable.name}
              type="button"
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between',
                index === selectedIndex && 'bg-gray-100'
              )}
              onClick={() => handleVariableClick(variable.name)}
            >
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-200 px-1.5 py-0.5 rounded font-mono">
                  {`{{${variable.name}}}`}
                </code>
                {variable.description && (
                  <span className="text-muted-foreground truncate">
                    {variable.description}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded',
                variable.scope === 'setup' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              )}>
                {variable.scope}
              </span>
            </button>
          ))}
        </div>
      )}
      
      {showDropdown && filteredVariables.length === 0 && searchTerm && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full bg-white border rounded-md shadow-lg p-3 text-sm text-muted-foreground"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
        >
          No variables match "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default VariableAutocomplete;
