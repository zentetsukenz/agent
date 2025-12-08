export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Load Tester © {new Date().getFullYear()} - Built with React & Vite
          </p>
        </div>
      </div>
    </footer>
  );
};
