import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, Radio, UserCog, Mail, BarChart3, Settings,
  Dumbbell, ClipboardCheck, TrendingUp, Calendar, User, LogOut, Bell, Menu, X, ChevronDown,
} from 'lucide-react';
import { Avatar, Badge } from './ui';
import { getUser, clearSession } from './api';
import { roleLabel, classNames } from './format';

// ============================================
// NAV ITEMS POR ROLE
// ============================================
const NAV_ITEMS = {
  ADMIN: [
    { to: '/adm/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
    { to: '/adm/students',  label: 'Alunos',      icon: Users },
    { to: '/adm/plans',     label: 'Planos',      icon: CreditCard },
    { to: '/adm/devices',   label: 'Devices',     icon: Radio },
    { to: '/adm/users',     label: 'Staff',       icon: UserCog },
    { to: '/adm/invites',   label: 'Convites',    icon: Mail },
    { to: '/adm/reports',   label: 'Relatórios',  icon: BarChart3 },
    { to: '/adm/config',    label: 'Configurações', icon: Settings },
  ],
  RECEPCAO: [
    { to: '/center/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
    { to: '/center/checkin',     label: 'Check-in',    icon: ClipboardCheck },
    { to: '/center/students',    label: 'Alunos',      icon: Users },
    { to: '/center/memberships', label: 'Matrículas',  icon: CreditCard },
  ],
  PROFESSOR: [
    { to: '/prof/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
    { to: '/prof/students',   label: 'Alunos',      icon: Users },
    { to: '/prof/workouts',   label: 'Treinos',     icon: Dumbbell },
    { to: '/prof/exercises',  label: 'Exercícios',  icon: Dumbbell },
    { to: '/prof/evolution',  label: 'Evolução',    icon: TrendingUp },
  ],
  ALUNO: [
    { to: '/aluno/dashboard', label: 'Meu painel',  icon: LayoutDashboard },
    { to: '/aluno/workouts',  label: 'Meus treinos', icon: Dumbbell },
    { to: '/aluno/evolution', label: 'Evolução',    icon: TrendingUp },
    { to: '/aluno/checkins',  label: 'Check-ins',   icon: Calendar },
    { to: '/aluno/profile',   label: 'Meu perfil',  icon: User },
  ],
};

// ============================================
// LOGO TRIAD
// ============================================
function Brand({ inverted = false }) {
  const bgClass = inverted
    ? 'bg-white/10 border-white/20'
    : 'bg-triad-50 border-triad-100';
  const iconColor = inverted ? 'white' : '#1a6b4f';
  const textClass = inverted ? 'text-white' : 'text-triad-800';
  const subClass = inverted ? 'text-white/60' : 'text-gray-500';

  return (
    <div className="flex items-center gap-3">
      <div className={classNames('w-10 h-10 rounded-lg border flex items-center justify-center', bgClass)}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M6 4v16M18 4v16M6 12h12" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={classNames('font-extrabold text-[15px] tracking-tight', textClass)}>TRIAD</span>
        <span className={classNames('text-[10px] tracking-[0.18em] uppercase mt-1', subClass)}>Academia</span>
      </div>
    </div>
  );
}

// ============================================
// SIDEBAR
// ============================================
function Sidebar({ role, mobileOpen, onClose }) {
  const navigate = useNavigate();
  const items = NAV_ITEMS[role] || [];

  const handleLogout = () => {
    if (confirm('Deseja sair da sua conta?')) {
      clearSession();
      navigate('/', { replace: true });
    }
  };

  const user = getUser();

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={classNames(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-60 bg-triad-950 text-white flex flex-col py-5 transition-transform',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className="px-5 pb-5 mb-4 border-b border-white/5">
          <Brand inverted />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  classNames(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-[13.5px] font-medium transition',
                    isActive
                      ? 'bg-triad-600 text-white font-semibold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )
                }
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 pt-4 mt-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition text-left"
          >
            <Avatar name={user?.name} variant="dark" size="md" />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-white truncate">{user?.name}</div>
              <div className="text-[11px] text-white/50 truncate">{roleLabel(user?.role)}</div>
            </div>
            <LogOut className="w-4 h-4 text-white/50 flex-shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
}

// ============================================
// TOPBAR
// ============================================
function Topbar({ onOpenSidebar }) {
  const user = getUser();

  return (
    <header className="bg-white border-b border-gray-200 px-5 lg:px-7 py-3 flex items-center gap-4 sticky top-0 z-30">
      {/* Menu mobile */}
      <button
        onClick={onOpenSidebar}
        className="lg:hidden w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb (placeholder) */}
      <div className="hidden lg:flex items-center gap-1.5 text-[13px] text-gray-500 font-medium">
        <span>Dashboard</span>
      </div>

      <div className="flex-1" />

      {/* Ações */}
      <button className="relative w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition">
        <Bell className="w-5 h-5" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
      </button>

      {/* User */}
      <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
        <Avatar name={user?.name} variant="dark" size="md" />
        <div className="hidden sm:block leading-tight">
          <div className="text-[13px] font-semibold text-gray-900">{user?.name}</div>
          <div className="text-[11px] text-gray-500">{user?.email}</div>
        </div>
      </div>
    </header>
  );
}

// ============================================
// APP LAYOUT (envolve todas as páginas internas)
// ============================================
export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getUser();

  // Fecha o menu mobile quando muda de rota
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        role={user?.role}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-0">
        <Topbar onOpenSidebar={() => setMobileOpen(true)} />

        <main className="flex-1 p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}