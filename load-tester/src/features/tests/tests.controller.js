/**
 * Tests Controller
 * HTTP request handlers for load test execution
 */

const testsService = require('./tests.service');
const endpointsService = require('../endpoints/endpoints.service');

/**
 * GET /endpoints/:id/test - Load test configuration page
 */
async function configure(req, res) {
  try {
    const endpoint = await endpointsService.getEndpointById(req.params.id);

    if (!endpoint) {
      return res.status(404).render('error', {
        message: 'Endpoint not found',
        error: { status: 404 }
      });
    }

    res.render('test/configure', {
      title: 'Load Test Configuration',
      endpoint,
      config: {},
      errors: [],
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error loading test configuration:', error);
    res.status(500).render('error', {
      message: 'Failed to load test configuration',
      error
    });
  }
}

/**
 * POST /endpoints/:id/test - Execute load test
 */
async function execute(req, res) {
  try {
    const endpoint = await endpointsService.getEndpointById(req.params.id);

    if (!endpoint) {
      return res.status(404).render('error', {
        message: 'Endpoint not found',
        error: { status: 404 }
      });
    }

    const validation = testsService.validateTestConfig(req.body);

    if (!validation.valid) {
      return res.status(400).render('test/configure', {
        title: 'Load Test Configuration',
        endpoint,
        config: req.body,
        errors: validation.errors,
        messages: req.flash()
      });
    }

    // Create test record
    const test = await testsService.createTest(req.params.id, req.body);

    // Execute test asynchronously
    testsService.executeTest(test.id).catch(error => {
      console.error('Test execution error:', error);
    });

    req.flash('success', 'Load test started');
    res.redirect(303, `/tests/${test.id}/results`);
  } catch (error) {
    console.error('Error starting test:', error);
    res.status(500).render('test/configure', {
      title: 'Load Test Configuration',
      endpoint,
      config: req.body,
      errors: ['Failed to start test'],
      messages: req.flash()
    });
  }
}

/**
 * GET /tests/:id/results - View test results
 */
async function results(req, res) {
  try {
    const test = await testsService.getTestResults(req.params.id);

    if (!test) {
      return res.status(404).render('error', {
        message: 'Test not found',
        error: { status: 404 }
      });
    }

    // Parse results if available
    let parsedResults = null;
    if (test.results) {
      try {
        parsedResults = JSON.parse(test.results);
      } catch (e) {
        console.error('Error parsing results:', e);
      }
    }

    res.render('test/results', {
      title: 'Test Results',
      test,
      results: parsedResults,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error loading test results:', error);
    res.status(500).render('error', {
      message: 'Failed to load test results',
      error
    });
  }
}

module.exports = {
  configure,
  execute,
  results
};
