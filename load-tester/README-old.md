# Load Tester

A simple, powerful load testing application built with Express.js and server-side rendering. Test your API endpoints with configurable load scenarios and get detailed performance metrics.

## Features

- ✅ **Endpoint Management**: Add, edit, delete, and list API endpoints
- ✅ **Load Test Configuration**: Configure duration, concurrent connections, and requests per second
- ✅ **Real-time Test Execution**: Run load tests with instant feedback
- ✅ **Detailed Results**: View response times (min/avg/max/p95), success rates, and throughput
- ✅ **Server-Side Rendering**: Fast, accessible EJS templates
- ✅ **SQLite Database**: Simple, zero-configuration data persistence
- ✅ **TDD Approach**: 80%+ code coverage with comprehensive tests

## Tech Stack

- **Backend**: Express.js 4.x
- **View Engine**: EJS
- **Database**: SQLite with Prisma ORM
- **Load Testing**: Autocannon
- **Testing**: Jest + Supertest
- **Session Management**: express-session + connect-flash

## Prerequisites

- Node.js 18+ and npm
- Basic understanding of HTTP and REST APIs

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd load-tester
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the `SESSION_SECRET` for production:
   ```
   DATABASE_URL="file:./dev.db"
   PORT=3000
   NODE_ENV=development
   SESSION_SECRET=your-secure-secret-key-here
   ```

4. **Set up the database**:
   ```bash
   npm run db:setup
   ```
   
   This will:
   - Create the SQLite database
   - Run Prisma migrations
   - Generate the Prisma Client

## Usage

### Development Mode

Start the server with auto-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Mode

```bash
npm start
```

## Testing

### Run all tests with coverage:

```bash
npm test
```

### Run tests in watch mode:

```bash
npm run test:watch
```

### Run only unit tests:

```bash
npm run test:unit
```

### Run only integration tests:

```bash
npm run test:integration
```

## Application Workflow

### 1. Add an Endpoint

1. Click "**+ Add Endpoint**" on the home page
2. Fill in the endpoint details:
   - **Name**: A descriptive name (e.g., "User API")
   - **URL**: The full endpoint URL (e.g., "https://api.example.com/users")
   - **Method**: HTTP method (GET, POST, PUT, DELETE, PATCH)
   - **Headers** (optional): JSON object with headers (e.g., `{"Authorization": "Bearer token"}`)
   - **Body** (optional): JSON object for request body
3. Click "**Create Endpoint**"

### 2. Configure and Run a Load Test

1. From the home page, click "**Test**" on any endpoint
2. Configure the test parameters:
   - **Duration**: Test duration in seconds (1-300)
   - **Concurrent Connections**: Number of parallel connections (1-1000)
   - **Requests Per Second** (optional): Target RPS (1-100000)
3. Click "**Start Load Test**"

### 3. View Test Results

- The results page will auto-refresh while the test is running
- Once completed, you'll see:
  - **Request Statistics**: Total requests, average RPS, success rate
  - **Latency Metrics**: Min, mean, max, p50, p90, p95, p99
  - **Throughput**: Average and total data transferred
  - **Error Counts**: Errors and timeouts

### 4. Manage Endpoints

- **Edit**: Modify endpoint configuration
- **Delete**: Remove endpoint and all associated tests
- **View History**: See all previous tests for an endpoint

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Home page with endpoint list |
| GET | `/endpoints/new` | New endpoint form |
| POST | `/endpoints` | Create endpoint |
| GET | `/endpoints/:id/edit` | Edit endpoint form |
| PUT | `/endpoints/:id` | Update endpoint |
| DELETE | `/endpoints/:id` | Delete endpoint |
| GET | `/endpoints/:id/test` | Test configuration form |
| POST | `/endpoints/:id/test` | Execute load test |
| GET | `/tests/:id/results` | View test results |

## Database Schema

### Endpoint Model
```prisma
model Endpoint {
  id        Int      @id @default(autoincrement())
  name      String
  url       String
  method    String   @default("GET")
  headers   String?
  body      String?
  createdAt DateTime @default(now())
  tests     Test[]
}
```

### Test Model
```prisma
model Test {
  id          Int       @id @default(autoincrement())
  endpointId  Int
  endpoint    Endpoint  @relation(fields: [endpointId], references: [id], onDelete: Cascade)
  duration    Int
  connections Int
  rps         Int?
  status      String    @default("pending")
  results     String?
  createdAt   DateTime  @default(now())
  completedAt DateTime?
}
```

## Project Structure

```
load-tester/
├── src/
│   ├── features/
│   │   ├── endpoints/
│   │   │   ├── endpoints.service.js      # Business logic
│   │   │   └── endpoints.controller.js   # HTTP handlers
│   │   └── tests/
│   │       ├── tests.service.js          # Load test logic
│   │       └── tests.controller.js       # HTTP handlers
│   ├── views/
│   │   ├── endpoints/
│   │   │   ├── new.ejs                   # New endpoint form
│   │   │   └── edit.ejs                  # Edit endpoint form
│   │   ├── test/
│   │   │   ├── configure.ejs             # Test config form
│   │   │   └── results.ejs               # Test results
│   │   ├── index.ejs                     # Home page
│   │   ├── layout.ejs                    # Layout template
│   │   └── error.ejs                     # Error page
│   ├── public/
│   │   └── css/
│   │       └── style.css                 # Styles
│   ├── app.js                            # Express app
│   └── server.js                         # Server entry
├── prisma/
│   ├── schema.prisma                     # Database schema
│   └── migrations/                       # Database migrations
├── tests/
│   ├── unit/                             # Unit tests
│   ├── integration/                      # Integration tests
│   └── setup.js                          # Test configuration
├── package.json
├── .env                                  # Environment variables
└── README.md
```

## Configuration

### Environment Variables

- `DATABASE_URL`: SQLite database file path (default: `file:./dev.db`)
- `PORT`: Server port (default: `3000`)
- `NODE_ENV`: Environment mode (`development` or `production`)
- `SESSION_SECRET`: Secret key for session encryption

### Load Test Limits

- **Duration**: 1-300 seconds
- **Connections**: 1-1000 concurrent connections
- **RPS**: 1-100,000 requests per second (optional)

## Development

### Adding New Features

1. Write tests first (TDD approach)
2. Implement the feature
3. Ensure tests pass
4. Maintain 80%+ code coverage

### Database Changes

1. Update `prisma/schema.prisma`
2. Create migration:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
3. Generate Prisma Client:
   ```bash
   npm run prisma:generate
   ```

### Viewing the Database

Use Prisma Studio to explore the database:

```bash
npm run prisma:studio
```

## Troubleshooting

### Tests Failing

1. Ensure test database is clean:
   ```bash
   rm -f prisma/test.db
   ```

2. Regenerate Prisma Client:
   ```bash
   npm run prisma:generate
   ```

### Database Issues

1. Delete the database and recreate:
   ```bash
   rm -f prisma/dev.db
   npm run db:setup
   ```

### Port Already in Use

Change the port in `.env`:
```
PORT=3001
```

## Performance Tips

1. **Start with lower connection counts** (10-50) to avoid overwhelming your target
2. **Use RPS limiting** to control load more precisely
3. **Monitor your target server** during tests
4. **Run tests from the same network** as your target for accurate results

## Security Considerations

- ⚠️ **Do not test endpoints you don't own** without permission
- ⚠️ **Change SESSION_SECRET** in production
- ⚠️ **Use HTTPS** in production
- ⚠️ **Consider rate limiting** for the application itself
- ⚠️ **Validate all URLs** before testing

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Implement your changes
5. Ensure all tests pass
6. Submit a pull request

## Support

For issues and questions, please create an issue in the repository.

---

Built with ❤️ using Express.js and the TDD workflow.
