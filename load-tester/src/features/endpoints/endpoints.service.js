/**
 * Endpoints Service
 * Business logic for endpoint management
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Validate endpoint data
 * @param {Object} data - Endpoint data to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateEndpointData(data) {
  const errors = [];

  // Validate name
  if (!data.name) {
    errors.push('Name is required');
  } else if (typeof data.name === 'string' && (data.name.length < 1 || data.name.length > 255)) {
    errors.push('Name must be between 1 and 255 characters');
  }

  // Validate URL
  if (!data.url) {
    errors.push('URL is required');
  } else {
    try {
      const url = new URL(data.url);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        errors.push('URL must be valid (http:// or https://)');
      }
    } catch (e) {
      errors.push('URL must be valid (http:// or https://)');
    }
  }

  // Validate method
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  if (data.method && !validMethods.includes(data.method)) {
    errors.push('Method must be one of: GET, POST, PUT, DELETE, PATCH');
  }

  // Validate headers (must be valid JSON if provided)
  if (data.headers && data.headers.trim() !== '') {
    try {
      JSON.parse(data.headers);
    } catch (e) {
      errors.push('Headers must be valid JSON');
    }
  }

  // Validate body (must be valid JSON if provided)
  if (data.body && data.body.trim() !== '') {
    try {
      JSON.parse(data.body);
    } catch (e) {
      errors.push('Body must be valid JSON');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get all endpoints
 * @returns {Promise<Array>} - List of endpoints
 */
async function getAllEndpoints() {
  return await prisma.endpoint.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tests: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });
}

/**
 * Get endpoint by ID
 * @param {number} id - Endpoint ID
 * @returns {Promise<Object|null>} - Endpoint or null
 */
async function getEndpointById(id) {
  return await prisma.endpoint.findUnique({
    where: { id: parseInt(id) },
    include: {
      tests: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

/**
 * Create new endpoint
 * @param {Object} data - Endpoint data
 * @returns {Promise<Object>} - Created endpoint
 */
async function createEndpoint(data) {
  return await prisma.endpoint.create({
    data: {
      name: data.name,
      url: data.url,
      method: data.method || 'GET',
      headers: data.headers && data.headers.trim() !== '' ? data.headers : null,
      body: data.body && data.body.trim() !== '' ? data.body : null
    }
  });
}

/**
 * Update endpoint
 * @param {number} id - Endpoint ID
 * @param {Object} data - Updated endpoint data
 * @returns {Promise<Object>} - Updated endpoint
 */
async function updateEndpoint(id, data) {
  return await prisma.endpoint.update({
    where: { id: parseInt(id) },
    data: {
      name: data.name,
      url: data.url,
      method: data.method,
      headers: data.headers && data.headers.trim() !== '' ? data.headers : null,
      body: data.body && data.body.trim() !== '' ? data.body : null
    }
  });
}

/**
 * Delete endpoint
 * @param {number} id - Endpoint ID
 * @returns {Promise<Object>} - Deleted endpoint
 */
async function deleteEndpoint(id) {
  return await prisma.endpoint.delete({
    where: { id: parseInt(id) }
  });
}

module.exports = {
  validateEndpointData,
  getAllEndpoints,
  getEndpointById,
  createEndpoint,
  updateEndpoint,
  deleteEndpoint
};
