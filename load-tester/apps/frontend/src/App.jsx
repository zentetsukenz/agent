import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateEndpoint } from './pages/CreateEndpoint';
import { EditEndpoint } from './pages/EditEndpoint';
import { ConfigureTest } from './pages/ConfigureTest';
import { TestResults } from './pages/TestResults';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/endpoints/new" element={<CreateEndpoint />} />
          <Route path="/endpoints/:id/edit" element={<EditEndpoint />} />
          <Route path="/endpoints/:id/test" element={<ConfigureTest />} />
          <Route path="/tests/:id/results" element={<TestResults />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
