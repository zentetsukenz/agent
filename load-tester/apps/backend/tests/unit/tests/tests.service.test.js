const path = require('path');
const { validateTestConfig } = require(path.join(__dirname, '../../../src/features/tests/tests.service'));

describe('Tests Service - Unit Tests', () => {
  describe('validateTestConfig', () => {
    test('should validate correct test configuration', () => {
      const validConfig = {
        duration: 30,
        connections: 10,
        rps: 100
      };

      const result = validateTestConfig(validConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should require duration field', () => {
      const invalidConfig = {
        connections: 10
      };

      const result = validateTestConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Duration is required');
    });

    test('should validate duration is a number', () => {
      const invalidConfig = {
        duration: 'not-a-number',
        connections: 10
      };

      const result = validateTestConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Duration must be a number');
    });

    test('should validate duration is between 1 and 300', () => {
      const invalidConfig = {
        duration: 0,
        connections: 10
      };

      const result = validateTestConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Duration must be between 1 and 300 seconds');
    });

    test('should validate duration max value', () => {
      const invalidConfig = {
        duration: 301,
        connections: 10
      };

      const result = validateTestConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Duration must be between 1 and 300 seconds');
    });

    test('should require connections field', () => {
      const invalidConfig = {
        duration: 30
      };

      const result = validateTestConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Connections is required');
    });

    test('should validate connections is a number', () => {
      const invalidConfig = {
        duration: 30,
        connections: 'not-a-number'
      };

      const result = validateTestConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Connections must be a number');
    });

    test('should validate connections is between 1 and 1000', () => {
      const invalidConfig = {
        duration: 30,
        connections: 0
      };

      const result = validateTestConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Connections must be between 1 and 1000');
    });

    test('should validate connections max value', () => {
      const invalidConfig = {
        duration: 30,
        connections: 1001
      };

      const result = validateTestConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Connections must be between 1 and 1000');
    });

    test('should allow optional rps field', () => {
      const validConfig = {
        duration: 30,
        connections: 10
      };

      const result = validateTestConfig(validConfig);
      expect(result.valid).toBe(true);
    });

    test('should validate rps is a number if provided', () => {
      const invalidConfig = {
        duration: 30,
        connections: 10,
        rps: 'not-a-number'
      };

      const result = validateTestConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('RPS must be a number');
    });

    test('should validate rps is between 1 and 100000 if provided', () => {
      const invalidConfig = {
        duration: 30,
        connections: 10,
        rps: 0
      };

      const result = validateTestConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('RPS must be between 1 and 100000');
    });

    test('should validate rps max value', () => {
      const invalidConfig = {
        duration: 30,
        connections: 10,
        rps: 100001
      };

      const result = validateTestConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('RPS must be between 1 and 100000');
    });

    test('should accept valid rps value', () => {
      const validConfig = {
        duration: 30,
        connections: 10,
        rps: 1000
      };

      const result = validateTestConfig(validConfig);
      expect(result.valid).toBe(true);
    });

    test('should return multiple errors for multiple validation failures', () => {
      const invalidConfig = {
        duration: 0,
        connections: 1001,
        rps: -1
      };

      const result = validateTestConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
