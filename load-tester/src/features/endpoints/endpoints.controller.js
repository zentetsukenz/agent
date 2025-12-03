/**
 * Endpoints Controller
 * HTTP request handlers for endpoint management
 */

const endpointsService = require('./endpoints.service');

/**
 * GET / - Home page with list of endpoints
 */
async function index(req, res) {
  try {
    const endpoints = await endpointsService.getAllEndpoints();
    res.render('index', {
      title: 'Load Tester',
      endpoints,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    res.status(500).render('error', {
      message: 'Failed to load endpoints',
      error
    });
  }
}

/**
 * GET /endpoints/new - Form to create new endpoint
 */
function newEndpoint(req, res) {
  res.render('endpoints/new', {
    title: 'Add New Endpoint',
    endpoint: {},
    errors: [],
    messages: req.flash()
  });
}

/**
 * POST /endpoints - Create new endpoint
 */
async function create(req, res) {
  try {
    const validation = endpointsService.validateEndpointData(req.body);

    if (!validation.valid) {
      return res.status(400).render('endpoints/new', {
        title: 'Add New Endpoint',
        endpoint: req.body,
        errors: validation.errors,
        messages: req.flash()
      });
    }

    await endpointsService.createEndpoint(req.body);
    req.flash('success', 'Endpoint created successfully');
    res.redirect(303, '/');
  } catch (error) {
    console.error('Error creating endpoint:', error);
    res.status(500).render('endpoints/new', {
      title: 'Add New Endpoint',
      endpoint: req.body,
      errors: ['Failed to create endpoint'],
      messages: req.flash()
    });
  }
}

/**
 * GET /endpoints/:id/edit - Form to edit endpoint
 */
async function edit(req, res) {
  try {
    const endpoint = await endpointsService.getEndpointById(req.params.id);

    if (!endpoint) {
      return res.status(404).render('error', {
        message: 'Endpoint not found',
        error: { status: 404 }
      });
    }

    res.render('endpoints/edit', {
      title: 'Edit Endpoint',
      endpoint,
      errors: [],
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error fetching endpoint:', error);
    res.status(500).render('error', {
      message: 'Failed to load endpoint',
      error
    });
  }
}

/**
 * PUT /endpoints/:id - Update endpoint
 */
async function update(req, res) {
  try {
    const endpoint = await endpointsService.getEndpointById(req.params.id);

    if (!endpoint) {
      return res.status(404).render('error', {
        message: 'Endpoint not found',
        error: { status: 404 }
      });
    }

    const validation = endpointsService.validateEndpointData(req.body);

    if (!validation.valid) {
      return res.status(400).render('endpoints/edit', {
        title: 'Edit Endpoint',
        endpoint: { ...endpoint, ...req.body },
        errors: validation.errors,
        messages: req.flash()
      });
    }

    await endpointsService.updateEndpoint(req.params.id, req.body);
    req.flash('success', 'Endpoint updated successfully');
    res.redirect(303, '/');
  } catch (error) {
    console.error('Error updating endpoint:', error);
    res.status(500).render('endpoints/edit', {
      title: 'Edit Endpoint',
      endpoint: req.body,
      errors: ['Failed to update endpoint'],
      messages: req.flash()
    });
  }
}

/**
 * DELETE /endpoints/:id - Delete endpoint
 */
async function destroy(req, res) {
  try {
    const endpoint = await endpointsService.getEndpointById(req.params.id);

    if (!endpoint) {
      return res.status(404).render('error', {
        message: 'Endpoint not found',
        error: { status: 404 }
      });
    }

    await endpointsService.deleteEndpoint(req.params.id);
    req.flash('success', 'Endpoint deleted successfully');
    res.redirect(303, '/');
  } catch (error) {
    console.error('Error deleting endpoint:', error);
    req.flash('error', 'Failed to delete endpoint');
    res.redirect(303, '/');
  }
}

module.exports = {
  index,
  newEndpoint,
  create,
  edit,
  update,
  destroy
};
