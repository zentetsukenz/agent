import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateEndpoint } from './pages/CreateEndpoint';
import { EditEndpoint } from './pages/EditEndpoint';
import { ConfigureTest } from './pages/ConfigureTest';
import { TestResults } from './pages/TestResults';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
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
