import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="bg-primary-600 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-white">Load Tester</h1>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-white hover:text-primary-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/endpoints/new" 
              className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors"
            >
              + Add Endpoint
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
