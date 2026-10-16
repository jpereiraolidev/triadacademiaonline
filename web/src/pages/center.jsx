import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Users, CreditCard, ClipboardCheck, LayoutDashboard,
  Search, Plus, Check, X, Activity, DollarSign, Calendar,
  Clock, ArrowRight,
} from 'lucide-react';
import { api, getErrorMessage, getUser } from '../api';
import {
  Button, Input, Select, Badge, Card, CardHeader, CardBody,
  Table, THead, TH, TBody, TR, TD, Avatar, Spinner, EmptyState,
  Skeleton, Modal, ConfirmModal, PageHeader,
} from '../ui';
import {
  formatNumber, formatCurrency, formatDate, formatDateTime,
  formatDuration, daysUntil, roleLabel,
} from '../format';

// ============================================
// 1. DASHBOARD RECEPÇÃO
// ============================================
export function CenterDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ checkins: 0, students: 0, memberships: 0, revenue: 0 });
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const user = getUser();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [checkinsRes, studentsRes, membershipsRes] = await Promise.all([
        api.get('/checkins?limit=200').catch(() => ({ data: [] })),
        api.get('/students').catch(() => ({ data: [] })),
        api.get('/memberships').catch(() => ({ data: [] })),
      ]);

      const checkins = checkinsRes.data || [];
      const students = studentsRes.data || [];
      const memberships = membershipsRes.data || [];

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      const todayCheckins = checkins.filter((c) => new Date(c.createdAt) >= hoje);
      const receita = memberships
        .filter((m) => new Date(m.startDate) >= inicioMes)
        .reduce((acc, m) => acc + Number(m.priceAtPurchase || 0), 0);

      setStats({
        checkins: todayCheckins.length,
        students: students.filter((s) => s.active).length,
        memberships: memberships.filter((m) => m.status === 'ATIVA').length,
        revenue: receita,
      });

      setRecentCheckins(checkins.slice(0, 8));

      // Matrículas vencendo em 7 dias
      const limite = new Date();
      limite.setDate(limite.getDate() + 7);
      const expirando = memberships
        .filter((m) => {
          const end = new Date(m.endDate);
          return end >= hoje && end <= limite && m.status === 'ATIVA';
        })
        .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
        .slice(0, 6);
      setExpiringSoon(expirando);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar dashboard'));
    } finally {
      setLoading(false);
    }
  }

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <>
      {/* Hero de boas-vindas */}
      <div
        className="rounded-xl p-6 mb-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f3d2e 0%, #1a6b4f 100%)' }}
      >
        <div className="relative z-10">
          <h2 className="text-xl font-bold tracking-tight mb-1">
            {saudacao}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-[13.5px] opacity-85">
            Você tem <strong>{stats.checkins}</strong> check-ins hoje e <strong>{stats.memberships}</strong> matrículas ativas.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-triad-50 text-triad-700 flex items-center justify-center flex-shrink-0">
              <Activity style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">Check-ins hoje</div>
              <div className="text-[28px] font-extrabold tracking-tight leading-tight mt-1 text-gray-900">
                {loading ? <Skeleton variant="value" /> : formatNumber(stats.checkins)}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Users style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">Alunos ativos</div>
              <div className="text-[28px] font-extrabold tracking-tight leading-tight mt-1 text-gray-900">
                {loading ? <Skeleton variant="value" /> : formatNumber(stats.students)}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <CreditCard style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">Matrículas ativas</div>
              <div className="text-[28px] font-extrabold tracking-tight leading-tight mt-1 text-gray-900">
                {loading ? <Skeleton variant="value" /> : formatNumber(stats.memberships)}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
              <DollarSign style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">Receita do mês</div>
              <div className="text-[28px] font-extrabold tracking-tight leading-tight mt-1 text-gray-900">
                {loading ? <Skeleton variant="value" /> : formatCurrency(stats.revenue)}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Grid 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Movimento recente */}
        <Card>
          <CardHeader title="Movimento recente" subtitle="Últimos check-ins" />
          {loading ? (
            <CardBody><Skeleton variant="block" /></CardBody>
          ) : recentCheckins.length === 0 ? (
            <EmptyState title="Sem check-ins" description="Nenhum registro hoje." />
          ) : (
            <div className="divide-y divide-gray-100">
              {recentCheckins.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={c.student?.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium truncate">{c.student?.name}</div>
                    <div className="text-xs text-gray-500">{formatDateTime(c.createdAt)}</div>
                  </div>
                  <Badge variant={c.status === 'AUTORIZADO' ? 'success' : 'danger'} dot>
                    {c.status === 'AUTORIZADO' ? 'Entrada' : 'Negado'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Vencendo em breve */}
        <Card>
          <CardHeader title="Vencendo nos próximos 7 dias" subtitle="Prioridade de contato" />
          {loading ? (
            <CardBody><Skeleton variant="block" /></CardBody>
          ) : expiringSoon.length === 0 ? (
            <EmptyState title="Nada vencendo" description="Nenhuma matrícula vence nos próximos 7 dias." />
          ) : (
            <div className="divide-y divide-gray-100">
              {expiringSoon.map((m) => {
                const dias = daysUntil(m.endDate);
                const variant = dias <= 2 ? 'danger' : dias <= 5 ? 'warning' : 'neutral';
                return (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={m.student?.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-medium truncate">{m.student?.name}</div>
                      <div className="text-xs text-gray-500">{formatDate(m.endDate)}</div>
                    </div>
                    <Badge variant={variant}>
                      {dias <= 0 ? 'Vencida' : dias === 1 ? 'Amanhã' : `${dias} dias`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

// ============================================
// 2. CHECK-IN MANUAL
// ============================================
export function CenterCheckin() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadStudents(); }, []);

  async function loadStudents() {
    setLoading(true);
    try {
      const { data } = await api.get('/students?active=true');
      setStudents(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar alunos'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckin(type) {
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/checkins', {
        studentId: selectedStudent.id,
        type,
        status: 'AUTORIZADO',
      });
      setLastResult({
        ok: true,
        studentName: selectedStudent.name,
        type,
        time: data.createdAt,
      });
      toast.success(`Check-in registrado: ${selectedStudent.name}`);
      setSelectedStudent(null);
      setSearch('');
      setTimeout(() => setLastResult(null), 5000);
    } catch (err) {
      // Se o backend retorna 403, é porque o aluno não tem matrícula (mas aqui é manual, então autoriza)
      setLastResult({
        ok: false,
        studentName: selectedStudent.name,
        error: getErrorMessage(err, 'Erro ao registrar check-in'),
      });
      toast.error(getErrorMessage(err, 'Erro ao registrar'));
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.includes(q)
    );
  }).slice(0, 8);

  return (
    <>
      <PageHeader
        title="Check-in"
        subtitle="Registre entradas de alunos manualmente."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Busca */}
        <Card>
          <CardHeader title="Buscar aluno" subtitle="Nome, email ou telefone" />
          <CardBody>
            <Input
              icon={Search}
              placeholder="Digite para buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />

            <div className="mt-4 space-y-1.5">
              {loading ? (
                <Skeleton variant="block" />
              ) : filtered.length === 0 ? (
                <EmptyState
                  title={search ? 'Nenhum aluno encontrado' : 'Digite para buscar'}
                  description={search ? 'Tente outro termo.' : 'Comece digitando o nome, email ou telefone.'}
                />
              ) : (
                filtered.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg transition text-left border ${
                      selectedStudent?.id === s.id
                        ? 'bg-triad-50 border-triad-200'
                        : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                    }`}
                  >
                    <Avatar name={s.name} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-semibold truncate">{s.name}</div>
                      <div className="text-xs text-gray-500 truncate">{s.email || s.phone || '—'}</div>
                    </div>
                    {selectedStudent?.id === s.id && (
                      <Check className="w-4 h-4 text-triad-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        {/* Ação */}
        <div>
          <Card>
            <CardHeader title="Registrar check-in" subtitle="Escolha o aluno e a ação" />
            <CardBody>
              {selectedStudent ? (
                <>
                  <div className="bg-triad-50 border border-triad-100 rounded-lg p-4 mb-5 flex items-center gap-3">
                    <Avatar name={selectedStudent.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold text-triad-900">{selectedStudent.name}</div>
                      <div className="text-xs text-triad-700">{selectedStudent.email || selectedStudent.phone || '—'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleCheckin('ENTRADA')}
                      loading={submitting}
                      className="!py-6 !text-base"
                    >
                      <ArrowRight className="w-5 h-5" />
                      Registrar Entrada
                    </Button>
                    <Button
                      onClick={() => handleCheckin('SAIDA')}
                      loading={submitting}
                      variant="outline"
                      className="!py-6 !text-base"
                    >
                      <ArrowRight className="w-5 h-5 rotate-180" />
                      Registrar Saída
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => { setSelectedStudent(null); setSearch(''); }}
                    className="w-full mt-3"
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <EmptyState
                  icon={ClipboardCheck}
                  title="Nenhum aluno selecionado"
                  description="Busque e clique em um aluno à esquerda para registrar."
                />
              )}
            </CardBody>
          </Card>

          {/* Resultado do último check-in */}
          {lastResult && (
            <div className={`mt-4 rounded-xl p-4 flex items-center gap-3 border ${
              lastResult.ok ? 'bg-triad-50 border-triad-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                lastResult.ok ? 'bg-triad-600 text-white' : 'bg-red-500 text-white'
              }`}>
                {lastResult.ok ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className={`text-[13.5px] font-bold ${lastResult.ok ? 'text-triad-900' : 'text-red-800'}`}>
                  {lastResult.ok ? `${lastResult.type} registrada` : 'Erro'}
                </div>
                <div className="text-xs text-gray-600">
                  {lastResult.ok
                    ? `${lastResult.studentName} · ${new Date(lastResult.time).toLocaleTimeString('pt-BR')}`
                    : lastResult.error}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================
// 3. CADASTRAR ALUNO (RECEPÇÃO)
// ============================================
export function CenterStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', birthDate: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadStudents(); }, []);

  async function loadStudents() {
    setLoading(true);
    try {
      const { data } = await api.get('/students');
      setStudents(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar'));
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({ name: '', email: '', phone: '', birthDate: '' });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || form.name.length < 2) return toast.error('Nome obrigatório');

    setSaving(true);
    try {
      await api.post('/students', {
        name: form.name,
        ...(form.email && { email: form.email }),
        ...(form.phone && { phone: form.phone }),
        ...(form.birthDate && { birthDate: form.birthDate }),
      });
      toast.success('Aluno cadastrado!');
      setModalOpen(false);
      loadStudents();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao cadastrar'));
    } finally {
      setSaving(false);
    }
  }

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  });

  return (
    <>
      <PageHeader
        title="Alunos"
        subtitle="Cadastre novos alunos na academia."
        action={<Button icon={Plus} onClick={openCreate}>Novo aluno</Button>}
      />

      <Card>
        <div className="p-4 border-b border-gray-100">
          <Input
            icon={Search}
            placeholder="Buscar aluno..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <CardBody><Skeleton variant="block" /></CardBody>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={students.length === 0 ? 'Nenhum aluno' : 'Nenhum resultado'}
            description={students.length === 0 ? 'Cadastre o primeiro aluno.' : 'Ajuste a busca.'}
          />
        ) : (
          <Table>
            <THead>
              <TR hover={false}>
                <TH>Nome</TH>
                <TH>Contato</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((s) => (
                <TR key={s.id}>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.name} />
                      <span className="font-semibold">{s.name}</span>
                    </div>
                  </TD>
                  <TD>
                    <div className="text-[13px]">{s.email || '—'}</div>
                    {s.phone && <div className="text-xs text-gray-500">{s.phone}</div>}
                  </TD>
                  <TD>
                    <Badge variant={s.active !== false ? 'success' : 'neutral'} dot>
                      {s.active !== false ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo aluno"
        subtitle="Preencha os dados básicos."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Cadastrar</Button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <Input
            label="Nome completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="João Silva"
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Telefone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <Input
            label="Data de nascimento"
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          />
        </form>
      </Modal>
    </>
  );
}

// ============================================
// 4. VENDER MATRÍCULA
// ============================================
export function CenterMemberships() {
  const [students, setStudents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    planId: '',
    startDate: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const [successModal, setSuccessModal] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [studentsRes, plansRes, membershipsRes] = await Promise.all([
        api.get('/students?active=true').catch(() => ({ data: [] })),
        api.get('/plans?active=true').catch(() => ({ data: [] })),
        api.get('/memberships').catch(() => ({ data: [] })),
      ]);
      setStudents(studentsRes.data || []);
      setPlans(plansRes.data || []);
      setRecent((membershipsRes.data || []).slice(0, 8));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar'));
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({
      studentId: '',
      planId: '',
      startDate: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.studentId) return toast.error('Selecione um aluno');
    if (!form.planId) return toast.error('Selecione um plano');

    setSaving(true);
    try {
      const { data } = await api.post('/memberships', {
        studentId: form.studentId,
        planId: form.planId,
        startDate: form.startDate,
      });

      const student = students.find((s) => s.id === form.studentId);
      const plan = plans.find((p) => p.id === form.planId);

      setSuccessModal({
        studentName: student?.name,
        planName: plan?.name,
        price: plan?.price,
        durationDays: plan?.durationDays,
        endDate: data.endDate,
      });
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao criar matrícula'));
    } finally {
      setSaving(false);
    }
  }

  const selectedPlan = plans.find((p) => p.id === form.planId);

  return (
    <>
      <PageHeader
        title="Matrículas"
        subtitle="Venda e renove planos de alunos."
        action={<Button icon={Plus} onClick={openCreate}>Nova matrícula</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Cards de planos disponíveis */}
        {plans.slice(0, 3).map((p) => (
          <Card key={p.id}>
            <CardBody>
              <div className="text-sm font-bold text-gray-900 mb-1">{p.name}</div>
              <div className="text-2xl font-extrabold tracking-tight text-triad-800 mb-1">
                {formatCurrency(p.price)}
              </div>
              <div className="text-xs text-gray-500">{formatDuration(p.durationDays)}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Últimas matrículas */}
      <Card>
        <CardHeader title="Últimas matrículas" subtitle="Vendas recentes" />
        {loading ? (
          <CardBody><Skeleton variant="block" /></CardBody>
        ) : recent.length === 0 ? (
          <EmptyState icon={CreditCard} title="Nenhuma matrícula" description="Nenhuma venda registrada ainda." />
        ) : (
          <Table>
            <THead>
              <TR hover={false}>
                <TH>Aluno</TH>
                <TH>Plano</TH>
                <TH>Início</TH>
                <TH>Vencimento</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {recent.map((m) => (
                <TR key={m.id}>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={m.student?.name} size="sm" />
                      <span className="font-medium">{m.student?.name || '—'}</span>
                    </div>
                  </TD>
                  <TD><Badge variant="neutral">{m.plan?.name || '—'}</Badge></TD>
                  <TD>{formatDate(m.startDate)}</TD>
                  <TD>{formatDate(m.endDate)}</TD>
                  <TD>
                    <Badge variant={m.status === 'ATIVA' ? 'success' : 'neutral'} dot>
                      {m.status}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      {/* Modal vender */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova matrícula"
        subtitle="Venda um plano para o aluno."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Confirmar venda</Button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <Select
            label="Aluno"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            options={[
              { value: '', label: 'Selecione...' },
              ...students.map((s) => ({ value: s.id, label: `${s.name}${s.email ? ' — ' + s.email : ''}` })),
            ]}
            required
          />
          <Select
            label="Plano"
            value={form.planId}
            onChange={(e) => setForm({ ...form, planId: e.target.value })}
            options={[
              { value: '', label: 'Selecione...' },
              ...plans.map((p) => ({
                value: p.id,
                label: `${p.name} — ${formatCurrency(p.price)} · ${formatDuration(p.durationDays)}`,
              })),
            ]}
            required
          />
          <Input
            label="Data de início"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            required
          />

          {selectedPlan && (
            <div className="bg-triad-50 border border-triad-100 rounded-lg p-4 mt-2">
              <div className="text-[13px] font-semibold text-triad-800 mb-2">Resumo da venda</div>
              <div className="flex justify-between text-[13px] mb-1">
                <span className="text-gray-600">Plano</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between text-[13px] mb-1">
                <span className="text-gray-600">Duração</span>
                <span className="font-medium">{formatDuration(selectedPlan.durationDays)}</span>
              </div>
              <div className="flex justify-between text-[15px] pt-2 mt-2 border-t border-triad-100">
                <span className="font-semibold text-triad-900">Total</span>
                <span className="font-extrabold text-triad-900">{formatCurrency(selectedPlan.price)}</span>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Modal sucesso */}
      <Modal
        open={!!successModal}
        onClose={() => setSuccessModal(null)}
        title="Matrícula confirmada!"
        footer={<Button onClick={() => setSuccessModal(null)}>Fechar</Button>}
      >
        {successModal && (
          <div className="text-center py-3">
            <div className="w-14 h-14 rounded-full bg-triad-100 text-triad-700 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7" />
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">{successModal.studentName}</div>
            <div className="text-sm text-gray-500 mb-4">
              {successModal.planName} · {formatCurrency(successModal.price)}
            </div>
            <div className="bg-triad-50 rounded-lg p-3 text-[13px]">
              <div className="text-gray-600">Vencimento</div>
              <div className="font-semibold text-triad-900">{formatDate(successModal.endDate)}</div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}