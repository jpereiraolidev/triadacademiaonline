import { Routes, Route, Navigate } from 'react-router-dom';
import { Login, Convite } from './pages/auth';
import AppLayout from './layout';
import { getToken, getUser, routeForRole } from './api';

// Páginas dos 4 perfis
import {
  AdmDashboard, AdmStudents, AdmPlans, AdmDevices,
  AdmUsers, AdmInvites, AdmReports, AdmConfig,
} from './pages/adm';
import {
  CenterDashboard, CenterCheckin, CenterStudents, CenterMemberships,
} from './pages/center';
import {
  ProfDashboard, ProfStudents, ProfWorkouts, ProfExercises, ProfEvolution,
} from './pages/prof';
import {
  AlunoDashboard, AlunoWorkouts, AlunoEvolution, AlunoCheckins, AlunoProfile,
} from './pages/aluno';

// ============================================
// GUARD DE ROTA
// ============================================
function RequireAuth({ role, children }) {
  const token = getToken();
  const user = getUser();

  // Não logado → login
  if (!token || !user) return <Navigate to="/" replace />;

  // Role errado → manda pro dashboard do role dele
  if (role && user.role !== role) return <Navigate to={routeForRole(user.role)} replace />;

  return children;
}

// ============================================
// WRAPPER: Auth + Layout + Página
// ============================================
function Page({ role, children }) {
  return (
    <RequireAuth role={role}>
      <AppLayout>{children}</AppLayout>
    </RequireAuth>
  );
}

// ============================================
// APP (rotas)
// ============================================
export default function App() {
  return (
    <Routes>
      {/* ============================================
          PÚBLICAS
          ============================================ */}
      <Route path="/" element={<Login />} />
      <Route path="/convite" element={<Convite />} />

      {/* ============================================
          ADMIN
          ============================================ */}
      <Route path="/adm/dashboard" element={<Page role="ADMIN"><AdmDashboard /></Page>} />
      <Route path="/adm/students"  element={<Page role="ADMIN"><AdmStudents /></Page>} />
      <Route path="/adm/plans"     element={<Page role="ADMIN"><AdmPlans /></Page>} />
      <Route path="/adm/devices"   element={<Page role="ADMIN"><AdmDevices /></Page>} />
      <Route path="/adm/users"     element={<Page role="ADMIN"><AdmUsers /></Page>} />
      <Route path="/adm/invites"   element={<Page role="ADMIN"><AdmInvites /></Page>} />
      <Route path="/adm/reports"   element={<Page role="ADMIN"><AdmReports /></Page>} />
      <Route path="/adm/config"    element={<Page role="ADMIN"><AdmConfig /></Page>} />

      {/* ============================================
          RECEPÇÃO
          ============================================ */}
      <Route path="/center/dashboard"   element={<Page role="RECEPCAO"><CenterDashboard /></Page>} />
      <Route path="/center/checkin"     element={<Page role="RECEPCAO"><CenterCheckin /></Page>} />
      <Route path="/center/students"    element={<Page role="RECEPCAO"><CenterStudents /></Page>} />
      <Route path="/center/memberships" element={<Page role="RECEPCAO"><CenterMemberships /></Page>} />

      {/* ============================================
          PROFESSOR
          ============================================ */}
      <Route path="/prof/dashboard" element={<Page role="PROFESSOR"><ProfDashboard /></Page>} />
      <Route path="/prof/students"  element={<Page role="PROFESSOR"><ProfStudents /></Page>} />
      <Route path="/prof/workouts"  element={<Page role="PROFESSOR"><ProfWorkouts /></Page>} />
      <Route path="/prof/exercises" element={<Page role="PROFESSOR"><ProfExercises /></Page>} />
      <Route path="/prof/evolution" element={<Page role="PROFESSOR"><ProfEvolution /></Page>} />

      {/* ============================================
          ALUNO
          ============================================ */}
      <Route path="/aluno/dashboard" element={<Page role="ALUNO"><AlunoDashboard /></Page>} />
      <Route path="/aluno/workouts"  element={<Page role="ALUNO"><AlunoWorkouts /></Page>} />
      <Route path="/aluno/evolution" element={<Page role="ALUNO"><AlunoEvolution /></Page>} />
      <Route path="/aluno/checkins"  element={<Page role="ALUNO"><AlunoCheckins /></Page>} />
      <Route path="/aluno/profile"   element={<Page role="ALUNO"><AlunoProfile /></Page>} />

      {/* ============================================
          FALLBACK
          ============================================ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}