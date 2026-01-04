# Load Tester - Monorepo

A powerful load testing application with separated frontend and backend architecture. Test your API endpoints with configurable load scenarios and get detailed performance metrics through a modern React interface.

## 🎯 Features

- ✅ **Endpoint Management**: Add, edit, delete, and list API endpoints
- ✅ **Load Test Configuration**: Configure duration, concurrent connections, and requests per second
- ✅ **Real-time Test Execution**: Run load tests with live status polling
- ✅ **Detailed Results**: View response times (min/avg/max/percentiles), success rates, and throughput
- ✅ **Modern React UI**: Fast, responsive SPA built with Vite
- ✅ **REST API Backend**: Clean API-first architecture
- ✅ **SQLite Database**: Simple, zero-configuration data persistence
- ✅ **TDD Approach**: Comprehensive test coverage
- ✅ **Scenario Builder**: Create complex load test scenarios with multiple phases
- ✅ **Workflow Mode**: Multi-step testing with setup, workflow, and teardown stages
- ✅ **Phase-Based Load Patterns**: Ramp up/down, sustained load, spike testing
- ✅ **Visual Load Preview**: Real-time chart showing load pattern over time
- ✅ **Mobile Responsive**: Full mobile support for all features

## 📦 Monorepo Structure

```
load-tester/
├── package.json              # Workspace root configuration
├── README.md                 # This file
├── apps/
│   ├── backend/              # Node.js REST API
│   │   ├── src/
│   │   ├── tests/
│   │   ├── prisma/
│   │   ├── package.json
│   │   └── README.md
│   └── frontend/             # React SPA
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── README.md
└── docs/
    └── API_DESIGN.md
```

## 🛠️ Tech Stack

### Backend

- **Framework**: Express.js 4.x
- **Database**: SQLite with Prisma ORM
- **Load Testing**: Autocannon
- **Testing**: Jest + Supertest
- **API**: RESTful JSON API with CORS

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Testing**: Vitest + React Testing Library

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Basic understanding of HTTP and REST APIs

### Installation

1. **Clone or navigate to the project directory**:

   ```bash
   cd load-tester
   ```

2. **Install all dependencies** (workspace + apps):

   ```bash
   npm run install:all
   ```

3. **Set up backend environment**:

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```

4. **Set up frontend environment**:

   ```bash
   cp apps/frontend/.env.example apps/frontend/.env
   ```

5. **Initialize database**:

   ```bash
   cd apps/backend
   npm run db:setup
   cd ../..
   ```

### Running the Application

#### Option 1: Run both applications together (recommended)

```bash
npm run dev
```

This starts both backend (<http://localhost:3001>) and frontend (<http://localhost:5173>) concurrently.

#### Option 2: Run applications separately

**Backend only:**

```bash
npm run backend
# or
cd apps/backend
npm run dev
```

**Frontend only:**

```bash
npm run frontend
# or
cd apps/frontend
npm run dev
```

### Access the Application

- **Frontend UI**: <http://localhost:5173>
- **Backend API**: <http://localhost:3001>
- **API Health Check**: <http://localhost:3001/api/health>

## 📖 Usage

### Creating an Endpoint

1. Click **"+ Add Endpoint"** on the dashboard
2. Fill in the endpoint details:
   - Name (e.g., "My API")
   - URL (e.g., "<https://api.example.com/users>")
   - Method (GET, POST, PUT, DELETE, PATCH)
   - Headers (optional, JSON format)
   - Body (optional, JSON format)
3. Click **"Create"**

### Running a Load Test

1. Click **"Run Test"** on any endpoint
2. Configure the test:
   - Duration: 1-300 seconds
   - Connections: 1-1000 concurrent
   - Requests/sec: 1-100000 (optional)
3. Click **"Start Test"**
4. View real-time status and results

### Viewing Results

Test results show:

- Total requests and average RPS
- Latency metrics (min, max, mean, p50, p90, p95, p99)
- Throughput (bytes/sec)
- Error count and success rate

### Creating Load Test Scenarios

Scenarios allow you to define complex, multi-phase load tests:

1. Go to **Scenarios** page
2. Click **"Create Scenario"**
3. Choose mode:
   - **Simple Mode**: Test a single endpoint with customizable load phases
   - **Workflow Mode**: Multi-step testing with setup, main workflow, and teardown stages
4. Configure load phases:
   - **Ramp Up**: Gradually increase connections
   - **Sustained**: Maintain constant load
   - **Ramp Down**: Gradually decrease connections
   - **Spike**: Sudden load increase for burst testing
5. Preview load pattern in the visual chart
6. Click **"Create Scenario"**

### Running Scenario Tests

1. Go to **Scenarios** list
2. Click **"Run"** on your scenario
3. Monitor real-time progress by phase
4. View detailed results including:
   - Phase-by-phase metrics
   - Overall performance summary
   - Error breakdown

### 🎬 Quick Demo: Testing a Public API

Try this demo to see load testing in action:

1. **Create an endpoint** for a public test API:
   - Name: `JSONPlaceholder Users`
   - URL: `https://jsonplaceholder.typicode.com/users`
   - Method: `GET`

2. **Use a built-in template** (go to Scenarios → select "Smoke Test"):
   - This template runs a quick test with 5 connections for 30 seconds
   - Click "Duplicate" to create your own copy
   - Click "Run Test"

3. **Create a custom stress test scenario**:
   - Go to Scenarios → Create Scenario
   - Name: `API Stress Test`
   - Add phases:
     - Phase 1: Ramp Up (30s, 1→50 connections)
     - Phase 2: Sustained (60s, 50 connections)
     - Phase 3: Ramp Down (30s, 50→1 connections)
   - Watch the load preview chart update
   - Click "Create Scenario" then "Run Test"

4. **Analyze results**:
   - View latency percentiles (p50, p90, p99)
   - Check throughput and success rate
   - Compare phase-by-phase performance

## 🧪 Testing

### Run all tests

```bash
npm run test:all
```

### Backend tests only

```bash
npm run backend:test
# or unit tests only
npm run backend:test:unit
# or integration tests only
npm run backend:test:integration
```

### Frontend tests only

```bash
npm run frontend:test
```

## 📚 API Documentation

### Base URL

```
http://localhost:3001/api
```

### Endpoints

#### Health Check

```
GET /api/health
```

#### Endpoint Management

```
GET    /api/endpoints           # List all endpoints
GET    /api/endpoints/:id       # Get single endpoint
POST   /api/endpoints           # Create endpoint
PUT    /api/endpoints/:id       # Update endpoint
DELETE /api/endpoints/:id       # Delete endpoint
```

#### Load Testing

```
POST   /api/endpoints/:id/test  # Execute load test
GET    /api/tests/:id           # Get test results
GET    /api/tests/:id/status    # Get test status (for polling)
DELETE /api/tests/:id/cancel    # Cancel running test
```

#### Scenarios

```
GET    /api/scenarios           # List all scenarios
GET    /api/scenarios/:id       # Get single scenario
POST   /api/scenarios           # Create scenario
PUT    /api/scenarios/:id       # Update scenario
DELETE /api/scenarios/:id       # Delete scenario
POST   /api/scenarios/:id/duplicate  # Duplicate scenario
```

For detailed API documentation, see [apps/backend/README.md](apps/backend/README.md).

## 🏗️ Development

### Project Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both backend and frontend in dev mode |
| `npm run backend` | Start backend in dev mode |
| `npm run backend:start` | Start backend in production mode |
| `npm run frontend` | Start frontend in dev mode |
| `npm run frontend:build` | Build frontend for production |
| `npm run frontend:preview` | Preview production build |
| `npm run test:all` | Run all tests (backend + frontend) |
| `npm run install:all` | Install all dependencies |

### Adding New Features

1. **Backend**: See [apps/backend/README.md](apps/backend/README.md)
2. **Frontend**: See [apps/frontend/README.md](apps/frontend/README.md)

### Code Quality

- Backend: 80%+ test coverage required
- Frontend: Component tests + integration tests
- Linting: ESLint configured for both apps

## 🔧 Environment Variables

### Backend (`apps/backend/.env`)

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (`apps/frontend/.env`)

```env
VITE_API_URL=http://localhost:3001/api/v1
```

## 📁 Database Management

### Migrations

```bash
cd apps/backend
npm run prisma:migrate
```

### Prisma Studio (DB GUI)

```bash
cd apps/backend
npm run prisma:studio
```

### Reset Database

```bash
cd apps/backend
rm prisma/dev.db
npm run db:setup
```

## 🏛️ Architecture

### Backend Architecture

```
apps/backend/
├── src/
│   ├── app.js                 # Express app + routes
│   ├── server.js              # Server entry point
│   └── features/
│       ├── endpoints/         # Endpoint CRUD
│       └── tests/             # Load test execution
```

**Pattern**: Controller → Service → Prisma Client

### Frontend Architecture

```
apps/frontend/
├── src/
│   ├── App.jsx               # Router configuration
│   ├── pages/                # Route pages
│   ├── components/           # Reusable components
│   ├── services/             # API client
│   ├── hooks/                # Custom React hooks
│   └── utils/                # Helper functions
```

**Pattern**: Component-driven development with service layer

## 🔄 Migration from SSR

This project was migrated from a server-side rendered Express application to a separated frontend/backend architecture:

- **Before**: Express + EJS templates
- **After**: React SPA + REST API

**Migration Benefits**:

- ✅ Better separation of concerns
- ✅ Independent deployment of frontend/backend
- ✅ Modern React development experience
- ✅ API can serve multiple clients
- ✅ Improved scalability

## 🚢 Deployment

### Backend Deployment

1. Build: No build step needed (Node.js)
2. Deploy: Any Node.js hosting (Heroku, Render, Railway, etc.)
3. Database: SQLite (or migrate to PostgreSQL for production)

### Frontend Deployment

1. Build:

   ```bash
   cd apps/frontend
   npm run build
   ```

2. Deploy: `dist/` folder to any static hosting (Vercel, Netlify, Cloudflare Pages)
3. Environment: Set `VITE_API_URL` to production backend URL

## 🤝 Contributing

1. Follow the existing code structure
2. Write tests for new features
3. Update documentation
4. Run linting before committing

## 📝 License

MIT

## 🙋 Support

For issues or questions:

1. Check the [Backend README](apps/backend/README.md)
2. Check the [Frontend README](apps/frontend/README.md)
3. Review [API Design Documentation](docs/API_DESIGN.md)

---

**Version**: 2.0.0  
**Architecture**: Monorepo with separated frontend/backend  
**Last Updated**: December 2025
