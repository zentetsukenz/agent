import { Header } from './Header';
import { Footer } from './Footer';

export const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                   bg-primary-600 text-white px-4 py-2 rounded-lg z-100
                   focus:outline-none focus:ring-2 focus:ring-primary-400"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
};
