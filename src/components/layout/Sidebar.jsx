import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calculator, Wind, History,
  User, Settings, Leaf, LogOut, Menu, X, Sprout,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/calculator',      icon: Calculator,       label: 'Calculator'      },
  { to: '/tree-plantation', icon: Sprout,           label: 'Tree Plantation' },
  { to: '/air-quality',     icon: Wind,             label: 'Air Quality'     },
  { to: '/history',         icon: History,          label: 'History'         },
  { to: '/profile',         icon: User,             label: 'Profile'         },
  { to: '/settings',        icon: Settings,         label: 'Settings'        },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/5">
        <div className="w-9 h-9 bg-gradient-to-br from-eco-500 to-teal-500 rounded-xl flex items-center justify-center shadow-eco flex-shrink-0">
          <Leaf size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-outfit font-bold text-lg text-white">EcoVision</span>
        )}
      </div>

      {/* User mini */}
      {!collapsed && user && (
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-eco-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user.avatar || user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isActive
                ? `nav-item-active ${collapsed ? 'justify-center' : ''}`
                : `nav-item ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-6 space-y-1 border-t border-white/5 pt-4">
        <button
          onClick={handleLogout}
          className={`nav-item w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 bg-surface-900/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-7 w-6 h-6 bg-surface-800 border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors z-50"
        >
          {collapsed ? <Menu size={12} /> : <X size={12} />}
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-xl text-white"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full w-64 z-50 bg-surface-900 border-r border-white/5 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
