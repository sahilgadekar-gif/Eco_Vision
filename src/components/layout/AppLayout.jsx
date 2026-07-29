import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Main app layout: sidebar + scrollable content area.
 * Used for all authenticated pages.
 */
const AppLayout = () => {
  return (
    <div className="min-h-screen flex bg-eco-gradient">
      <Sidebar />
      {/* Content shifts right by sidebar width on desktop */}
      <main className="flex-1 lg:ml-60 transition-all duration-300 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-8 animate-fadeIn">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
