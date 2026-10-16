import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { api, getToken, getUser, setSession, routeForRole, getErrorMessage } from '../api';
import { Input, Button } from '../ui';

// ============================================
// LOGO TRIAD (usado nas duas telas)
// ============================================
function Brand({ inverted = false }) {
  const bgClass   = inverted ? 'bg-white/10 border-white/20' : 'bg-triad-50 border-triad-100';
  const iconColor = inverted ? 'white' : '#1a6b4f';
  const textClass = inverted ? 'text-white' : 'text-triad-800';
  const subClass  = inverted ? 'text-white/60' : 'text-gray-500';

  return (
    <div className="flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${bgClass}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="M6 4v16M18 4v16M6 12h12" />
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className={`font-extrabold text-lg tracking-tight ${textClass}`}>TRIAD</span>
        <span className={`text-[11px] tracking-[0.18em] uppercase ${subClass}`}>Academia</span>
      </div>
    </div>
  );
}

// ============================================
// LOGIN
// ============================================
export function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  // Se já tá logado, redireciona
  if (getToken()) {
    return <Navigate to={routeForRole(getUser()?.role)} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setSession(data.token, data.user);
      toast.success(`Bem-vindo, ${data.user.name.split(' ')[0]}!`);
      navigate(routeForRole(data.user.role), { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao entrar'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ============ VISUAL ============ */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f3d2e 0%, #1a6b4f 100%)' }}
      >
        <div className="relative z-10">
          <Brand inverted />
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight mb-4">
            Mais que uma academia,
            <br />
            <span className="text-triad-500">um estilo de vida.</span>
          </h1>
          <p className="text-base opacity-85">
            Gerencie alunos, treinos, matrículas e check-ins em uma única plataforma.
          </p>
        </div>

        <div className="relative z-10 flex gap-8 text-sm opacity-80">
          <span>✓ Controle total</span>
          <span>✓ Acesso rápido</span>
          <span>✓ Seguro</span>
        </div>
      </div>

      {/* ============ FORM ============ */}
      <div className="flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Brand />
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-1">Bem-vindo de volta</h2>
          <p className="text-sm text-gray-500 mb-6">Entre com suas credenciais.</p>

          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              required
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <Button type="submit" loading={loading} className="w-full mt-2">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CONVITE (aceitar convite via ?token=...)
// ============================================
export function Convite() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();

  const [invite, setInvite]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState(null);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Carrega o convite
  useState(() => {
    if (!token) {
      setError('Link inválido: sem token.');
      setLoading(false);
      return;
    }

    api.get(`/invites/${encodeURIComponent(token)}`)
      .then(({ data }) => setInvite(data.invite))
      .catch((err) => setError(getErrorMessage(err, 'Convite inválido')))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) return toast.error('Senha mínima de 8 caracteres');
    if (password !== password2) return toast.error('As senhas não coincidem');
    if (!acceptedTerms) return toast.error('Aceite os termos de uso');

    setSubmitting(true);
    try {
      const { data } = await api.post(`/invites/${encodeURIComponent(token)}/accept`, { password });
      setSession(data.token, data.user);
      toast.success(`Conta criada, ${data.user.name.split(' ')[0]}!`);
      navigate(routeForRole(data.user.role), { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao criar conta'));
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- Estados ----------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-triad-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Validando seu convite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Convite inválido</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <Button variant="outline" onClick={() => navigate('/', { replace: true })}>
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }

  // ---------- Form ----------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <div className="lg:hidden mb-8 flex justify-center">
          <Brand />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight mb-1">Crie sua conta</h2>
            <p className="text-sm text-gray-500">Preencha os dados abaixo para ativar seu acesso.</p>
          </div>

          {/* Info do convite */}
          <div className="bg-triad-50 border border-triad-100 rounded-lg p-4 mb-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-triad-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {(invite?.name || invite?.email || '?')
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-triad-800 truncate">
                {invite?.name || 'Convidado'}
              </div>
              <div className="text-xs text-triad-700/80 truncate">
                {invite?.email || '—'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Input
              label="Nome completo"
              value={invite?.name || ''}
              readOnly
              disabled
            />
            <Input
              label="Email"
              value={invite?.email || ''}
              readOnly
              disabled
            />
            <Input
              label="Crie sua senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
            />
            <Input
              label="Confirmar senha"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Repita a senha"
              autoComplete="new-password"
              required
            />

            <label className="flex items-start gap-2.5 cursor-pointer text-[13px] text-gray-600 mb-5">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-triad-600 cursor-pointer"
              />
              <span>
                Li e aceito os <a href="#" onClick={(e) => e.preventDefault()} className="text-triad-700 font-medium hover:underline">termos de uso</a> e a <a href="#" onClick={(e) => e.preventDefault()} className="text-triad-700 font-medium hover:underline">política de privacidade</a>.
              </span>
            </label>

            <Button type="submit" loading={submitting} className="w-full">
              Criar minha conta
            </Button>
          </form>

          <div className="text-center text-xs text-gray-400 mt-6">
            Já tem conta?{' '}
            <a href="/" className="text-triad-700 font-medium hover:underline">
              Fazer login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}