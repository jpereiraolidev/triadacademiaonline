import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Users, CreditCard, Radio, UserCog, Mail, BarChart3, Settings,
  Plus, Search, Edit, Trash2, Lock, Copy, Send, RefreshCw, Download,
  Check, AlertTriangle, TrendingUp, Calendar, Activity, DollarSign,
  Eye, EyeOff, Save, RotateCw, X, Upload, FileText, KeyRound, ExternalLink,
} from 'lucide-react';
import { api, getErrorMessage } from '../api';
import {
  Button, Input, Select, Textarea, Badge, Card, CardHeader, CardBody,
  Table, THead, TH, TBody, TR, TD, Avatar, Spinner, EmptyState, Skeleton,
  Toggle, Modal, ConfirmModal, PageHeader,
} from '../ui';
import {
  formatNumber, formatCurrency, formatDate, formatDateShort, formatDateTime,
  formatDuration, daysUntil, roleLabel, initials, isValidEmail,
} from '../format';

// ============================================
// KPI CARD (reutilizado no dashboard)
// ============================================
function KpiCard({ icon: Icon, label, value, delta, deltaType = 'up', color = 'default' }) {
  const colors = {
    default: 'bg-triad-50 text-triad-700',
    blue:    'bg-blue-100 text-blue-600',
    amber:   'bg-amber-100 text-amber-600',
    purple:  'bg-purple-100 text-purple-600',
  };

  return (
    <Card>
      <CardBody className="flex items-start gap-3.5">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
          <Icon className="w-5.5 h-5.5" style={{ width: 22, height: 22 }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">{label}</div>
          <div className="text-[28px] font-extrabold tracking-tight leading-tight mt-1 mb-1 text-gray-900">{value}</div>
          {delta && (
            <div className={`text-xs font-medium ${deltaType === 'up' ? 'text-triad-600' : 'text-red-500'}`}>
              {delta}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================
// 1. DASHBOARD ADMIN
// ============================================
export function AdmDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    checkins: 0,
    memberships: 0,
    revenue: 0,
  });
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [upcomingRenewals, setUpcomingRenewals] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [studentsRes, checkinsRes, membershipsRes] = await Promise.all([
        api.get('/students').catch(() => ({ data: [] })),
        api.get('/checkins?limit=500').catch(() => ({ data: [] })),
        api.get('/memberships').catch(() => ({ data: [] })),
      ]);

      const students = studentsRes.data || [];
      const checkins = checkinsRes.data || [];
      const memberships = membershipsRes.data || [];

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      const activeStudents = students.filter((s) => s.active).length;
      const todayCheckins = checkins.filter((c) => new Date(c.createdAt) >= hoje).length;
      const activeMemberships = memberships.filter((m) => m.status === 'ATIVA').length;
      const revenue = memberships
        .filter((m) => new Date(m.startDate) >= inicioMes)
        .reduce((acc, m) => acc + Number(m.priceAtPurchase || 0), 0);

      setStats({
        students: activeStudents,
        checkins: todayCheckins,
        memberships: activeMemberships,
        revenue,
      });

      // Últimos 5 check-ins
      setRecentCheckins(checkins.slice(0, 5));

      // Próximas renovações (30 dias)
      const limite = new Date();
      limite.setDate(limite.getDate() + 30);
      const renovacoes = memberships
        .filter((m) => {
          const end = new Date(m.endDate);
          return end >= hoje && end <= limite && m.status === 'ATIVA';
        })
        .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
        .slice(0, 5);
      setUpcomingRenewals(renovacoes);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar dashboard'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Visão geral da academia"
        subtitle="Acompanhe as principais atividades e o desempenho do seu negócio."
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={Users}
          label="Alunos ativos"
          value={loading ? <Skeleton variant="value" /> : formatNumber(stats.students)}
          delta={`${formatNumber(stats.students)} ativos`}
          color="default"
        />
        <KpiCard
          icon={Activity}
          label="Check-ins hoje"
          value={loading ? <Skeleton variant="value" /> : formatNumber(stats.checkins)}
          delta="Hoje"
          color="blue"
        />
        <KpiCard
          icon={CreditCard}
          label="Matrículas ativas"
          value={loading ? <Skeleton variant="value" /> : formatNumber(stats.memberships)}
          delta="Ativas agora"
          color="amber"
        />
        <KpiCard
          icon={DollarSign}
          label="Receita do mês"
          value={loading ? <Skeleton variant="value" /> : formatCurrency(stats.revenue)}
          delta="Este mês"
          color="purple"
        />
      </div>

      {/* 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Últimos check-ins */}
        <Card>
          <CardHeader title="Últimos check-ins" subtitle="Registros mais recentes" />
          {loading ? (
            <CardBody><Skeleton variant="block" /></CardBody>
          ) : recentCheckins.length === 0 ? (
            <EmptyState title="Sem check-ins" description="Nenhum registro recente." />
          ) : (
            <Table>
              <THead>
                <TR hover={false}>
                  <TH>Aluno</TH>
                  <TH>Data/Hora</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {recentCheckins.map((c) => (
                  <TR key={c.id}>
                    <TD>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.student?.name} size="sm" />
                        <span className="font-medium">{c.student?.name || '—'}</span>
                      </div>
                    </TD>
                    <TD>{formatDateTime(c.createdAt)}</TD>
                    <TD>
                      <Badge variant={c.status === 'AUTORIZADO' ? 'success' : 'danger'} dot>
                        {c.status === 'AUTORIZADO' ? 'Autorizado' : 'Negado'}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>

        {/* Próximas renovações */}
        <Card>
          <CardHeader title="Próximas renovações" subtitle="Vencendo nos próximos 30 dias" />
          {loading ? (
            <CardBody><Skeleton variant="block" /></CardBody>
          ) : upcomingRenewals.length === 0 ? (
            <EmptyState title="Sem renovações próximas" description="Nada nos próximos 30 dias." />
          ) : (
            <div className="divide-y divide-gray-100">
              {upcomingRenewals.map((m) => {
                const dias = daysUntil(m.endDate);
                const variant = dias <= 2 ? 'danger' : dias <= 7 ? 'warning' : 'neutral';
                return (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={m.student?.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-medium truncate">{m.student?.name}</div>
                      <div className="text-xs text-gray-500">{formatDate(m.endDate)}</div>
                    </div>
                    <Badge variant="neutral">{m.plan?.name || '—'}</Badge>
                    <Badge variant={variant}>
                      {dias <= 0 ? 'Vencida' : dias === 1 ? '1 dia' : `${dias} dias`}
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
// 2. ALUNOS
// ============================================
export function AdmStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [inviteModal, setInviteModal] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', birthDate: '', active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadStudents(); }, [statusFilter]);

  async function loadStudents() {
    setLoading(true);
    try {
      const params = statusFilter ? `?active=${statusFilter}` : '';
      const { data } = await api.get(`/students${params}`);
      setStudents(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar alunos'));
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', birthDate: '', active: true });
    setModalOpen(true);
  }

  function openEdit(s) {
    setEditing(s);
    setForm({
      name: s.name || '',
      email: s.email || '',
      phone: s.phone || '',
      birthDate: s.birthDate ? s.birthDate.slice(0, 10) : '',
      active: s.active !== false,
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || form.name.length < 2) return toast.error('Nome obrigatório');
    if (form.email && !isValidEmail(form.email)) return toast.error('Email inválido');

    setSaving(true);
    try {
      const body = {
        name: form.name,
        ...(form.email && { email: form.email }),
        ...(form.phone && { phone: form.phone }),
        ...(form.birthDate && { birthDate: form.birthDate }),
      };

      if (editing) {
        body.active = form.active;
        await api.patch(`/students/${editing.id}`, body);
        toast.success('Aluno atualizado!');
      } else {
        await api.post('/students', body);
        toast.success('Aluno cadastrado!');
      }
      setModalOpen(false);
      loadStudents();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao salvar'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    try {
      await api.delete(`/students/${confirmDelete.id}`);
      toast.success('Aluno desativado');
      setConfirmDelete(null);
      loadStudents();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao desativar'));
    }
  }

  async function handleReactivate(s) {
    try {
      await api.patch(`/students/${s.id}`, { active: true });
      toast.success('Aluno reativado');
      loadStudents();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao reativar'));
    }
  }

  async function handleGenerateInvite(s) {
    try {
      const { data } = await api.post('/invites', {
        studentId: s.id,
        type: 'ALUNO',
        expiresInDays: 7,
      });
      setInviteModal({
        name: s.name,
        link: `${window.location.origin}/convite?token=${data.token}`,
      });
    } catch (err) {
      if (err.response?.status === 409) toast.error('Aluno já possui conta ativa');
      else toast.error(getErrorMessage(err, 'Erro ao gerar convite'));
    }
  }

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  });

  return (
    <>
      <PageHeader
        title="Alunos"
        subtitle="Gerencie os alunos matriculados na academia."
        action={
          <Button icon={Plus} onClick={openCreate}>Novo aluno</Button>
        }
      />

      <Card>
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[240px]">
            <Input
              icon={Search}
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos os status' },
              { value: 'true', label: 'Ativos' },
              { value: 'false', label: 'Inativos' },
            ]}
            className="w-44"
          />
        </div>

        {/* Tabela */}
        {loading ? (
          <CardBody><Skeleton variant="block" /></CardBody>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={students.length === 0 ? 'Nenhum aluno cadastrado' : 'Nenhum resultado'}
            description={students.length === 0 ? 'Clique em "Novo aluno" para começar.' : 'Ajuste a busca ou o filtro.'}
          />
        ) : (
          <Table>
            <THead>
              <TR hover={false}>
                <TH>Aluno</TH>
                <TH>Contato</TH>
                <TH>Nascimento</TH>
                <TH>Status</TH>
                <TH align="right">Ações</TH>
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
                  <TD>{formatDate(s.birthDate)}</TD>
                  <TD>
                    <Badge variant={s.active !== false ? 'success' : 'neutral'} dot>
                      {s.active !== false ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TD>
                  <TD align="right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => handleGenerateInvite(s)}
                        className="w-8 h-8 rounded-md hover:bg-triad-50 text-gray-500 hover:text-triad-700 flex items-center justify-center transition"
                        title="Gerar convite"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(s)}
                        className="w-8 h-8 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center transition"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {s.active !== false ? (
                        <button
                          onClick={() => setConfirmDelete(s)}
                          className="w-8 h-8 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center transition"
                          title="Desativar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(s)}
                          className="w-8 h-8 rounded-md hover:bg-triad-50 text-gray-500 hover:text-triad-700 flex items-center justify-center transition"
                          title="Reativar"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      {/* Modal criar/editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar aluno' : 'Novo aluno'}
        subtitle={editing ? 'Atualize os dados do aluno.' : 'Preencha os dados do aluno.'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Salvar</Button>
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
              placeholder="joao@email.com"
            />
            <Input
              label="Telefone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+55 11 99999-9999"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Data de nascimento"
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            />
            {editing && (
              <div>
                <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">Status</label>
                <div className="flex items-center gap-2 pt-2">
                  <Toggle
                    checked={form.active}
                    onChange={(v) => setForm({ ...form, active: v })}
                  />
                  <span className="text-sm text-gray-600">{form.active ? 'Ativo' : 'Inativo'}</span>
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Confirm desativar */}
      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeactivate}
        title="Desativar aluno"
        subtitle={confirmDelete?.name}
        message="O aluno ficará inativo, mas o histórico será mantido. Pode ser reativado depois."
        confirmLabel="Desativar"
      />

      {/* Modal convite */}
      <Modal
        open={!!inviteModal}
        onClose={() => setInviteModal(null)}
        title="Convite gerado!"
        subtitle={inviteModal ? `Convite para ${inviteModal.name}` : ''}
        footer={<Button onClick={() => setInviteModal(null)}>Fechar</Button>}
      >
        {inviteModal && (
          <>
            <div className="bg-triad-50 border border-triad-100 rounded-lg p-4 mb-3">
              <div className="text-[12.5px] font-semibold text-triad-800 mb-2">🔗 Link do convite</div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={inviteModal.link}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-triad-100 rounded-lg"
                  onClick={(e) => e.target.select()}
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteModal.link);
                    toast.success('Link copiado!');
                  }}
                  icon={Copy}
                >
                  Copiar
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Envie este link para o aluno. Expira em 7 dias.
            </p>
          </>
        )}
      </Modal>
    </>
  );
}

// ============================================
// 3. PLANOS
// ============================================
export function AdmPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', durationDays: '', description: '', active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadPlans(); }, []);

  async function loadPlans() {
    setLoading(true);
    try {
      const { data } = await api.get('/plans');
      setPlans(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar planos'));
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', price: '', durationDays: 30, description: '', active: true });
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      name: p.name || '',
      price: p.price || '',
      durationDays: p.durationDays || '',
      description: p.description || '',
      active: p.active !== false,
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name) return toast.error('Nome obrigatório');
    if (form.price === '' || Number(form.price) < 0) return toast.error('Preço inválido');
    if (!form.durationDays || Number(form.durationDays) < 1) return toast.error('Duração inválida');

    setSaving(true);
    try {
      const body = {
        name: form.name,
        price: Number(form.price),
        durationDays: Number(form.durationDays),
        ...(form.description && { description: form.description }),
      };

      if (editing) {
        body.active = form.active;
        await api.patch(`/plans/${editing.id}`, body);
        toast.success('Plano atualizado!');
      } else {
        await api.post('/plans', body);
        toast.success('Plano criado!');
      }
      setModalOpen(false);
      loadPlans();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao salvar'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    try {
      await api.delete(`/plans/${confirmDelete.id}`);
      toast.success('Plano desativado');
      setConfirmDelete(null);
      loadPlans();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao desativar'));
    }
  }

  async function handleReactivate(p) {
    try {
      await api.patch(`/plans/${p.id}`, { active: true });
      toast.success('Plano reativado');
      loadPlans();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao reativar'));
    }
  }

  return (
    <>
      <PageHeader
        title="Planos"
        subtitle="Gerencie os planos de matrícula oferecidos pela academia."
        action={<Button icon={Plus} onClick={openCreate}>Novo plano</Button>}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardBody><Skeleton variant="block" /></CardBody></Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <EmptyState
            icon={CreditCard}
            title="Nenhum plano cadastrado"
            description='Clique em "Novo plano" para criar o primeiro.'
            action={<Button icon={Plus} onClick={openCreate}>Novo plano</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => {
            const active = p.active !== false;
            return (
              <Card key={p.id} className={active ? '' : 'opacity-60'}>
                <div className="p-5 border-b border-triad-100 bg-gradient-to-br from-triad-50 to-white rounded-t-xl relative">
                  <div className="text-base font-bold text-triad-900 mb-1">{p.name}</div>
                  <div className="text-[12.5px] text-triad-700">
                    {formatDuration(p.durationDays)} · {p.durationDays} dias
                  </div>
                  {!active && (
                    <span className="absolute top-3 right-3 bg-gray-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      INATIVO
                    </span>
                  )}
                </div>
                <CardBody>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-sm font-semibold text-gray-500">R$</span>
                    <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                      {Number(p.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-[13px] text-gray-600 leading-relaxed mb-4 min-h-[40px]">
                    {p.description || <span className="opacity-60 italic">Sem descrição</span>}
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Button size="sm" variant="outline" icon={Edit} onClick={() => openEdit(p)} className="flex-1">
                      Editar
                    </Button>
                    {active ? (
                      <Button size="sm" variant="outline" icon={Trash2} onClick={() => setConfirmDelete(p)} className="flex-1 !text-red-500 !border-red-200">
                        Desativar
                      </Button>
                    ) : (
                      <Button size="sm" variant="primary" icon={Check} onClick={() => handleReactivate(p)} className="flex-1">
                        Reativar
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar plano' : 'Novo plano'}
        subtitle="Defina os dados do plano de matrícula."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Salvar</Button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <Input
            label="Nome do plano"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Mensal, Trimestral, Anual..."
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Preço (R$)"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="149.90"
              required
            />
            <Input
              label="Duração (dias)"
              type="number"
              min="1"
              value={form.durationDays}
              onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
              placeholder="30"
              hint={form.durationDays ? `≈ ${formatDuration(form.durationDays)}` : ''}
              required
            />
          </div>
          <Textarea
            label="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Ex: Acesso livre à musculação e aulas coletivas."
          />
          {editing && (
            <div className="flex items-center gap-2 mt-2">
              <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} />
              <span className="text-sm text-gray-600">{form.active ? 'Ativo' : 'Inativo'}</span>
            </div>
          )}
        </form>
      </Modal>

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeactivate}
        title="Desativar plano"
        subtitle={confirmDelete?.name}
        message="O plano ficará inativo e não poderá ser usado em novas matrículas. As matrículas existentes continuam válidas."
        confirmLabel="Desativar"
      />
    </>
  );
}

// ============================================
// 4. DEVICES
// ============================================
export function AdmDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [apiKeyModal, setApiKeyModal] = useState(null);
  const [confirmRotate, setConfirmRotate] = useState(null);
  const [form, setForm] = useState({ name: '', identifier: '', active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadDevices(); }, []);

  async function loadDevices() {
    setLoading(true);
    try {
      const { data } = await api.get('/devices');
      setDevices(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar devices'));
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', identifier: '', active: true });
    setModalOpen(true);
  }

  function openEdit(d) {
    setEditing(d);
    setForm({ name: d.name || '', identifier: d.identifier || '', active: d.active !== false });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || form.name.length < 2) return toast.error('Nome obrigatório');
    if (!form.identifier || form.identifier.length < 3) return toast.error('Identificador obrigatório');
    if (!/^[a-z0-9\-_]+$/i.test(form.identifier)) return toast.error('Só letras, números, hífen e underline');

    setSaving(true);
    try {
      const body = { name: form.name, identifier: form.identifier };

      if (editing) {
        body.active = form.active;
        await api.patch(`/devices/${editing.id}`, body);
        toast.success('Device atualizado!');
        setModalOpen(false);
        loadDevices();
      } else {
        const { data } = await api.post('/devices', body);
        setModalOpen(false);
        loadDevices();
        setApiKeyModal({ key: data.apiKey, name: form.name, action: 'criado' });
      }
    } catch (err) {
      if (err.response?.status === 409) toast.error('Identificador já está em uso');
      else toast.error(getErrorMessage(err, 'Erro ao salvar'));
    } finally {
      setSaving(false);
    }
  }

  async function handleRotate() {
    try {
      const { data } = await api.post(`/devices/${confirmRotate.id}/rotate-key`);
      setConfirmRotate(null);
      setApiKeyModal({ key: data.apiKey, name: confirmRotate.name, action: 'rotacionada' });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao rotacionar'));
    }
  }

  async function handleDeactivate() {
    try {
      await api.delete(`/devices/${confirmDelete.id}`);
      toast.success('Device desativado');
      setConfirmDelete(null);
      loadDevices();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao desativar'));
    }
  }

  async function handleReactivate(d) {
    try {
      await api.patch(`/devices/${d.id}`, { active: true });
      toast.success('Device reativado');
      loadDevices();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao reativar'));
    }
  }

  return (
    <>
      <PageHeader
        title="Devices"
        subtitle="Catracas e leitores que fazem check-in automático via API key."
        action={<Button icon={Plus} onClick={openCreate}>Novo device</Button>}
      />

      <Card>
        {loading ? (
          <CardBody><Skeleton variant="block" /></CardBody>
        ) : devices.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="Nenhum device cadastrado"
            description='Clique em "Novo device" para conectar a primeira catraca.'
          />
        ) : (
          <Table>
            <THead>
              <TR hover={false}>
                <TH>Device</TH>
                <TH>Identificador</TH>
                <TH>Status</TH>
                <TH>Criado em</TH>
                <TH align="right">Ações</TH>
              </TR>
            </THead>
            <TBody>
              {devices.map((d) => (
                <TR key={d.id}>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-triad-100 text-triad-700 flex items-center justify-center">
                        <Radio className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">{d.name}</span>
                    </div>
                  </TD>
                  <TD>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{d.identifier}</code>
                  </TD>
                  <TD>
                    <Badge variant={d.active !== false ? 'success' : 'neutral'} dot>
                      {d.active !== false ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TD>
                  <TD>{formatDate(d.createdAt)}</TD>
                  <TD align="right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => setConfirmRotate(d)}
                        className="w-8 h-8 rounded-md hover:bg-triad-50 text-gray-500 hover:text-triad-700 flex items-center justify-center transition"
                        title="Rotacionar chave"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(d)}
                        className="w-8 h-8 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center transition"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {d.active !== false ? (
                        <button
                          onClick={() => setConfirmDelete(d)}
                          className="w-8 h-8 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center transition"
                          title="Desativar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(d)}
                          className="w-8 h-8 rounded-md hover:bg-triad-50 text-gray-500 hover:text-triad-700 flex items-center justify-center transition"
                          title="Reativar"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      {/* Modal criar/editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar device' : 'Novo device'}
        subtitle="Catraca ou leitor que fará check-ins automáticos."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Salvar</Button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <Input
            label="Nome do device"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Catraca entrada, Leitor recepção..."
            required
          />
          <Input
            label="Identificador"
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            placeholder="catraca-01, recepcao-norte..."
            hint="Único por device. Use letras, números, hífen ou underline."
            required
          />
          {editing && (
            <div className="flex items-center gap-2 mt-2">
              <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} />
              <span className="text-sm text-gray-600">{form.active ? 'Ativo' : 'Inativo'}</span>
            </div>
          )}
        </form>
      </Modal>

      {/* Modal API key */}
      <Modal
        open={!!apiKeyModal}
        onClose={() => setApiKeyModal(null)}
        title={apiKeyModal ? `API key ${apiKeyModal.action}` : ''}
        subtitle={apiKeyModal ? `Device: ${apiKeyModal.name}` : ''}
        footer={<Button onClick={() => setApiKeyModal(null)}>Já copiei</Button>}
      >
        {apiKeyModal && (
          <>
            <div className="bg-amber-50 border border-amber-500 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-[13px] font-bold text-amber-800 mb-1.5">
                <AlertTriangle className="w-4 h-4" />
                Copie esta chave agora
              </div>
              <p className="text-[12.5px] text-amber-800 leading-relaxed mb-3">
                Esta é a <strong>única vez</strong> que ela será exibida. Guarde em um lugar seguro e configure no device físico.
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={apiKeyModal.key}
                  className="flex-1 px-3 py-2.5 font-mono text-[13px] bg-white border border-amber-300 rounded-lg"
                  onClick={(e) => e.target.select()}
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(apiKeyModal.key);
                    toast.success('API key copiada!');
                  }}
                  icon={Copy}
                >
                  Copiar
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3.5 text-[12.5px] text-gray-600 leading-relaxed">
              <strong className="text-gray-800">Como usar:</strong><br />
              O device físico deve enviar a chave no header{' '}
              <code className="bg-gray-200 px-1.5 py-0.5 rounded text-[11.5px]">X-Device-Key</code> em cada requisição para{' '}
              <code className="bg-gray-200 px-1.5 py-0.5 rounded text-[11.5px]">POST /api/v1/checkins/device</code>.
            </div>
          </>
        )}
      </Modal>

      {/* Confirm rotate */}
      <ConfirmModal
        open={!!confirmRotate}
        onClose={() => setConfirmRotate(null)}
        onConfirm={handleRotate}
        title="Rotacionar chave"
        subtitle={confirmRotate?.name}
        message="Isso vai gerar uma nova API key. A chave antiga será invalidada imediatamente — você precisará reconfigurar o device físico."
        confirmLabel="Rotacionar"
      />

      {/* Confirm delete */}
      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeactivate}
        title="Desativar device"
        subtitle={confirmDelete?.name}
        message="O device ficará inativo e não poderá fazer check-ins até ser reativado."
        confirmLabel="Desativar"
      />
    </>
  );
}

// ============================================
// 5. STAFF (USERS)
// ============================================
export function AdmUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [passwordModal, setPasswordModal] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'PROFESSOR', password: '', active: true });
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar usuários'));
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', email: '', role: 'PROFESSOR', password: '', active: true });
    setModalOpen(true);
  }

  function openEdit(u) {
    setEditing(u);
    setForm({
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'PROFESSOR',
      password: '',
      active: u.active !== false,
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || form.name.length < 2) return toast.error('Nome obrigatório');
    if (!isValidEmail(form.email)) return toast.error('Email inválido');
    if (!editing && form.password.length < 8) return toast.error('Senha mínima de 8 caracteres');

    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/users/${editing.id}`, {
          name: form.name,
          email: form.email,
          role: form.role,
          active: form.active,
        });
        toast.success('Usuário atualizado!');
      } else {
        await api.post('/users', {
          name: form.name,
          email: form.email,
          role: form.role,
          password: form.password,
        });
        toast.success('Usuário criado!');
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      if (err.response?.status === 409) toast.error('Email já cadastrado');
      else toast.error(getErrorMessage(err, 'Erro ao salvar'));
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (newPassword.length < 8) return toast.error('Senha mínima de 8 caracteres');
    if (newPassword !== newPassword2) return toast.error('As senhas não coincidem');

    try {
      await api.patch(`/users/${passwordModal.id}/password`, { password: newPassword });
      toast.success('Senha atualizada!');
      setPasswordModal(null);
      setNewPassword('');
      setNewPassword2('');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao trocar senha'));
    }
  }

  async function handleDeactivate() {
    try {
      await api.delete(`/users/${confirmDelete.id}`);
      toast.success('Usuário desativado');
      setConfirmDelete(null);
      loadUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao desativar'));
    }
  }

  async function handleReactivate(u) {
    try {
      await api.patch(`/users/${u.id}`, { active: true });
      toast.success('Usuário reativado');
      loadUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao reativar'));
    }
  }

  const filtered = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    const q = search.toLowerCase();
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <>
      <PageHeader
        title="Staff"
        subtitle="Administradores, professores e recepção com acesso ao sistema."
        action={<Button icon={Plus} onClick={openCreate}>Novo usuário</Button>}
      />

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[240px]">
            <Input
              icon={Search}
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos os roles' },
              { value: 'ADMIN', label: 'Administradores' },
              { value: 'PROFESSOR', label: 'Professores' },
              { value: 'RECEPCAO', label: 'Recepção' },
            ]}
            className="w-48"
          />
        </div>

        {loading ? (
          <CardBody><Skeleton variant="block" /></CardBody>
        ) : filtered.length === 0 ? (
          <EmptyState icon={UserCog} title="Nenhum usuário" description="Ajuste os filtros ou crie um novo." />
        ) : (
          <Table>
            <THead>
              <TR hover={false}>
                <TH>Usuário</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH align="right">Ações</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((u) => (
                <TR key={u.id}>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} variant={u.role?.toLowerCase()} />
                      <div>
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <Badge variant={u.role?.toLowerCase()}>{roleLabel(u.role)}</Badge>
                  </TD>
                  <TD>
                    <Badge variant={u.active !== false ? 'success' : 'neutral'} dot>
                      {u.active !== false ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TD>
                  <TD align="right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => setPasswordModal(u)}
                        className="w-8 h-8 rounded-md hover:bg-triad-50 text-gray-500 hover:text-triad-700 flex items-center justify-center transition"
                        title="Trocar senha"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(u)}
                        className="w-8 h-8 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center transition"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {u.active !== false ? (
                        <button
                          onClick={() => setConfirmDelete(u)}
                          className="w-8 h-8 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center transition"
                          title="Desativar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(u)}
                          className="w-8 h-8 rounded-md hover:bg-triad-50 text-gray-500 hover:text-triad-700 flex items-center justify-center transition"
                          title="Reativar"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      {/* Modal criar/editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar usuário' : 'Novo usuário'}
        subtitle="Dados do staff e permissões de acesso."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Salvar</Button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <Input
            label="Nome completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Select
            label="Função"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[
              { value: 'ADMIN', label: 'Administrador' },
              { value: 'PROFESSOR', label: 'Professor' },
              { value: 'RECEPCAO', label: 'Recepção' },
            ]}
            required
          />
          {!editing && (
            <Input
              label="Senha inicial"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 8 caracteres"
              hint="O usuário pode trocar depois."
              required
            />
          )}
          {editing && (
            <div className="flex items-center gap-2 mt-2">
              <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} />
              <span className="text-sm text-gray-600">{form.active ? 'Ativo' : 'Inativo'}</span>
            </div>
          )}
        </form>
      </Modal>

      {/* Modal trocar senha */}
      <Modal
        open={!!passwordModal}
        onClose={() => setPasswordModal(null)}
        title="Trocar senha"
        subtitle={passwordModal ? `Alterando senha de ${passwordModal.name}` : ''}
        footer={
          <>
            <Button variant="outline" onClick={() => setPasswordModal(null)}>Cancelar</Button>
            <Button onClick={handlePasswordChange}>Trocar senha</Button>
          </>
        }
      >
        <form onSubmit={handlePasswordChange}>
          <Input
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
          />
          <Input
            label="Confirmar senha"
            type="password"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            placeholder="Repita a senha"
            required
          />
        </form>
      </Modal>

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeactivate}
        title="Desativar usuário"
        subtitle={confirmDelete?.name}
        message="O usuário perderá acesso ao sistema. Os registros criados por ele serão mantidos."
        confirmLabel="Desativar"
      />
    </>
  );
}

// ============================================
// 6. CONVITES
// ============================================
export function AdmInvites() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('PENDING');
  const [modalOpen, setModalOpen] = useState(false);
  const [linkModal, setLinkModal] = useState(null);
  const [confirmRevoke, setConfirmRevoke] = useState(null);
  const [form, setForm] = useState({
    type: 'ALUNO',
    role: '',
    name: '',
    email: '',
    phone: '',
    expiresInDays: 7,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadInvites(); }, [tab]);

  async function loadInvites() {
    setLoading(true);
    try {
      const status = tab === 'ALL' ? 'PENDING' : tab;
      const { data } = await api.get(`/invites/pending?status=${status}&limit=500`);
      setInvites(data.invites || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar convites'));
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({ type: 'ALUNO', role: '', name: '', email: '', phone: '', expiresInDays: 7 });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || form.name.length < 2) return toast.error('Nome obrigatório');
    if (!isValidEmail(form.email)) return toast.error('Email inválido');
    if (form.type === 'STAFF' && !form.role) return toast.error('Selecione uma função');

    setSaving(true);
    try {
      const body = {
        type: form.type,
        name: form.name,
        email: form.email,
        expiresInDays: Number(form.expiresInDays) || 7,
        ...(form.phone && { phone: form.phone }),
        ...(form.type === 'STAFF' && { role: form.role }),
      };
      const { data } = await api.post('/invites', body);
      setModalOpen(false);
      loadInvites();
      setLinkModal({
        name: form.name,
        link: `${window.location.origin}/convite?token=${data.token}`,
        inviteId: data.invite.id,
        expiresInDays: form.expiresInDays,
      });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao criar convite'));
    } finally {
      setSaving(false);
    }
  }

  async function handleRevoke() {
    try {
      await api.post(`/invites/${confirmRevoke.id}/revoke`);
      toast.success('Convite revogado');
      setConfirmRevoke(null);
      loadInvites();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao revogar'));
    }
  }

  async function handleMarkSent(invite) {
    try {
      await api.post(`/invites/${invite.id}/mark-sent`, { via: 'manual' });
      toast.success('Marcado como enviado');
      loadInvites();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao marcar'));
    }
  }

  return (
    <>
      <PageHeader
        title="Convites"
        subtitle="Gere links de convite para alunos e staff criarem suas contas."
        action={<Button icon={Plus} onClick={openCreate}>Novo convite</Button>}
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-5">
        {[
          { value: 'PENDING',  label: 'Pendentes' },
          { value: 'SENT',     label: 'Enviados' },
          { value: 'ACCEPTED', label: 'Aceitos' },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2.5 text-[13.5px] font-semibold border-b-2 -mb-px transition ${
              tab === t.value
                ? 'text-triad-700 border-triad-600'
                : 'text-gray-500 border-transparent hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <CardBody><Skeleton variant="block" /></CardBody>
        ) : invites.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="Nenhum convite aqui"
            description={tab === 'PENDING' ? 'Clique em "Novo convite" para criar o primeiro.' : 'Nada nesta categoria.'}
          />
        ) : (
          <Table>
            <THead>
              <TR hover={false}>
                <TH>Convidado</TH>
                <TH>Tipo</TH>
                <TH>Status</TH>
                <TH>Expira em</TH>
                <TH align="right">Ações</TH>
              </TR>
            </THead>
            <TBody>
              {invites.map((i) => {
                const dias = daysUntil(i.expiresAt);
                const expVariant = dias < 0 ? 'neutral' : dias <= 2 ? 'warning' : 'neutral';
                const statusMap = {
                  PENDING:  { variant: 'warning', label: 'Pendente' },
                  SENT:     { variant: 'info',    label: 'Enviado' },
                  ACCEPTED: { variant: 'success', label: 'Aceito' },
                  EXPIRED:  { variant: 'neutral', label: 'Expirado' },
                  REVOKED:  { variant: 'danger',  label: 'Revogado' },
                };
                const st = statusMap[i.status] || { variant: 'neutral', label: i.status };

                return (
                  <TR key={i.id}>
                    <TD>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={i.name || i.email} />
                        <div>
                          <div className="font-semibold">{i.name || '—'}</div>
                          <div className="text-xs text-gray-500">{i.email}</div>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <Badge variant={i.type === 'STAFF' ? 'admin' : 'aluno'}>
                        {i.type === 'STAFF' ? (roleLabel(i.role) || 'Staff') : 'Aluno'}
                      </Badge>
                    </TD>
                    <TD><Badge variant={st.variant} dot>{st.label}</Badge></TD>
                    <TD>
                      <span className={dias <= 2 && dias >= 0 ? 'text-amber-600 font-semibold' : 'text-gray-700'}>
                        {dias < 0 ? 'Expirado' : dias === 0 ? 'Hoje' : `${dias} dia${dias > 1 ? 's' : ''}`}
                      </span>
                    </TD>
                    <TD align="right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => {
                            const link = `${window.location.origin}/convite?token=${i.token}`;
                            navigator.clipboard.writeText(link);
                            toast.success('Link copiado!');
                          }}
                          className="w-8 h-8 rounded-md hover:bg-triad-50 text-gray-500 hover:text-triad-700 flex items-center justify-center transition"
                          title="Copiar link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {i.status === 'PENDING' && (
                          <button
                            onClick={() => handleMarkSent(i)}
                            className="w-8 h-8 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center transition"
                            title="Marcar como enviado"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {(i.status === 'PENDING' || i.status === 'SENT') && (
                          <button
                            onClick={() => setConfirmRevoke(i)}
                            className="w-8 h-8 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center transition"
                            title="Revogar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>

      {/* Modal criar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo convite"
        subtitle="Gere um link para o convidado criar a conta."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Gerar convite</Button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'ALUNO', role: '' })}
              className={`flex flex-col items-center gap-1.5 p-3.5 rounded-lg border-2 transition ${
                form.type === 'ALUNO' ? 'border-triad-600 bg-triad-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-triad-100 text-triad-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-[12.5px] font-semibold text-gray-700">Aluno</div>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'STAFF' })}
              className={`flex flex-col items-center gap-1.5 p-3.5 rounded-lg border-2 transition ${
                form.type === 'STAFF' ? 'border-triad-600 bg-triad-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <UserCog className="w-4 h-4" />
              </div>
              <div className="text-[12.5px] font-semibold text-gray-700">Staff</div>
            </button>
          </div>

          {form.type === 'STAFF' && (
            <Select
              label="Função"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={[
                { value: '', label: 'Selecione...' },
                { value: 'ADMIN', label: 'Administrador' },
                { value: 'PROFESSOR', label: 'Professor' },
                { value: 'RECEPCAO', label: 'Recepção' },
              ]}
              required
            />
          )}

          <Input
            label="Nome completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Telefone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="Expira em (dias)"
              type="number"
              min="1"
              max="30"
              value={form.expiresInDays}
              onChange={(e) => setForm({ ...form, expiresInDays: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Modal link */}
      <Modal
        open={!!linkModal}
        onClose={() => setLinkModal(null)}
        title="Convite gerado!"
        subtitle={linkModal ? `Convite para ${linkModal.name}` : ''}
        footer={<Button onClick={() => setLinkModal(null)}>Fechar</Button>}
      >
        {linkModal && (
          <>
            <div className="bg-triad-50 border border-triad-100 rounded-lg p-4 mb-3">
              <div className="text-[12.5px] font-semibold text-triad-800 mb-2">🔗 Link do convite</div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={linkModal.link}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-triad-100 rounded-lg"
                  onClick={(e) => e.target.select()}
                />
                <Button
                  icon={Copy}
                  onClick={() => {
                    navigator.clipboard.writeText(linkModal.link);
                    toast.success('Link copiado!');
                  }}
                >
                  Copiar
                </Button>
              </div>
              <div className="text-xs text-triad-700 mt-2">
                Expira em {linkModal.expiresInDays} dias.
              </div>
            </div>
          </>
        )}
      </Modal>

      <ConfirmModal
        open={!!confirmRevoke}
        onClose={() => setConfirmRevoke(null)}
        onConfirm={handleRevoke}
        title="Revogar convite"
        subtitle={confirmRevoke?.name || confirmRevoke?.email}
        message="O convite será invalidado imediatamente. Se o link já foi enviado, deixará de funcionar."
        confirmLabel="Revogar"
      />
    </>
  );
}

// ============================================
// 7. RELATÓRIOS
// ============================================
export function AdmReports() {
  const [checkins, setCheckins] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => { loadData(); }, [period]);

  async function loadData() {
    setLoading(true);
    try {
      const from = new Date();
      from.setDate(from.getDate() - period);
      from.setHours(0, 0, 0, 0);
      const to = new Date();
      to.setHours(23, 59, 59, 999);

      const [checkinsRes, membershipsRes] = await Promise.all([
        api.get(`/checkins?limit=500&from=${from.toISOString()}&to=${to.toISOString()}`).catch(() => ({ data: [] })),
        api.get('/memberships').catch(() => ({ data: [] })),
      ]);

      setCheckins(checkinsRes.data || []);
      setMemberships(membershipsRes.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar relatórios'));
    } finally {
      setLoading(false);
    }
  }

  // Cálculos
  const uniqueStudents = new Set(checkins.map((c) => c.studentId)).size;

  const newMemberships = memberships.filter((m) => {
    const d = new Date(m.startDate);
    const from = new Date();
    from.setDate(from.getDate() - period);
    return d >= from;
  });
  const revenue = newMemberships.reduce((acc, m) => acc + Number(m.priceAtPurchase || 0), 0);

  // Top alunos
  const counts = {};
  checkins.forEach((c) => {
    if (!c.student) return;
    const k = c.studentId;
    if (!counts[k]) counts[k] = { name: c.student.name, count: 0 };
    counts[k].count++;
  });
  const topStudents = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <>
      <PageHeader
        title="Relatórios"
        subtitle="Análise de check-ins, matrículas e frequência dos alunos."
      />

      {/* Filtro de período */}
      <Card className="mb-5">
        <CardBody className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[7, 30, 90, 365].map((d) => (
              <button
                key={d}
                onClick={() => setPeriod(d)}
                className={`px-3.5 py-1.5 text-[13px] font-semibold rounded-md transition ${
                  period === d ? 'bg-white text-triad-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {d === 365 ? '1 ano' : `${d} dias`}
              </button>
            ))}
          </div>
          <Button variant="outline" icon={Download} size="sm">Exportar CSV</Button>
        </CardBody>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={Activity}
          label="Check-ins no período"
          value={loading ? <Skeleton variant="value" /> : formatNumber(checkins.length)}
          delta={`Últimos ${period} dias`}
        />
        <KpiCard
          icon={Users}
          label="Alunos únicos"
          value={loading ? <Skeleton variant="value" /> : formatNumber(uniqueStudents)}
          delta="Frequentaram"
          color="blue"
        />
        <KpiCard
          icon={CreditCard}
          label="Novas matrículas"
          value={loading ? <Skeleton variant="value" /> : formatNumber(newMemberships.length)}
          delta="Iniciadas"
          color="amber"
        />
        <KpiCard
          icon={DollarSign}
          label="Receita do período"
          value={loading ? <Skeleton variant="value" /> : formatCurrency(revenue)}
          delta="Total"
          color="purple"
        />
      </div>

      {/* Top alunos */}
      <Card>
        <CardHeader title="Top 10 alunos mais frequentes" subtitle={`Últimos ${period} dias`} />
        {loading ? (
          <CardBody><Skeleton variant="block" /></CardBody>
        ) : topStudents.length === 0 ? (
          <EmptyState title="Sem dados no período" description="Nenhum check-in registrado." />
        ) : (
          <Table>
            <THead>
              <TR hover={false}>
                <TH>#</TH>
                <TH>Aluno</TH>
                <TH align="right">Check-ins</TH>
              </TR>
            </THead>
            <TBody>
              {topStudents.map((s, i) => (
                <TR key={i}>
                  <TD><span className="font-bold text-gray-400">{i + 1}</span></TD>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.name} size="sm" />
                      <span className="font-semibold">{s.name}</span>
                    </div>
                  </TD>
                  <TD align="right"><Badge variant="success">{s.count}</Badge></TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </>
  );
}

// ============================================
// 8. CONFIGURAÇÕES
// ============================================
export function AdmConfig() {
  const STORAGE_KEY = 'triad_academy_config';

  const DEFAULTS = {
    academyName: 'Triad Academia',
    academyEmail: '',
    academyPhone: '',
    academyAddress: '',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    notifyExpiring: true,
    notifyDenied: true,
    notifyNewStudent: false,
    notifyWeekly: false,
    sessionTimeout: 60,
    requireStrongPassword: true,
    require2FA: false,
  };

  const [config, setConfig] = useState(DEFAULTS);
  const [dirty, setDirty] = useState(false);
  const [health, setHealth] = useState({ status: 'checking', ms: 0, ts: null });
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      setConfig({ ...DEFAULTS, ...saved });
    } catch {
      setConfig(DEFAULTS);
    }
    checkHealth();
  }, []);

  async function checkHealth() {
    setHealth({ status: 'checking', ms: 0, ts: null });
    const t0 = Date.now();
    try {
      await api.get('/_ping');
      setHealth({ status: 'ok', ms: Date.now() - t0, ts: new Date().toISOString() });
    } catch (err) {
      setHealth({ status: 'error', ms: Date.now() - t0, ts: new Date().toISOString() });
    }
  }

  function update(key, value) {
    setConfig({ ...config, [key]: value });
    setDirty(true);
  }

  function handleSave() {
    if (!config.academyName || config.academyName.length < 2) {
      return toast.error('Nome da academia é obrigatório');
    }
    if (config.academyEmail && !isValidEmail(config.academyEmail)) {
      return toast.error('Email de contato inválido');
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setDirty(false);
      toast.success('Configurações salvas!');
    } catch {
      toast.error('Erro ao salvar');
    }
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(DEFAULTS);
    setDirty(false);
    setConfirmReset(false);
    toast.success('Configurações resetadas');
  }

  return (
    <>
      <PageHeader
        title="Configurações"
        subtitle="Preferências da academia e informações do sistema."
      />

      {/* Aviso modo local */}
      <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 mb-5 flex gap-3 items-start text-[13px] text-amber-800">
        <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" style={{ width: 18, height: 18 }} />
        <div>
          <strong>Modo local</strong> — estas configurações são salvas apenas neste navegador. O backend ainda não possui rotas para persistir configs da academia.
        </div>
      </div>

      {/* Dados da academia */}
      <Card className="mb-5">
        <CardHeader title="Dados da academia" subtitle="Informações gerais do sistema" />
        <CardBody>
          <Input
            label="Nome da academia"
            value={config.academyName}
            onChange={(e) => update('academyName', e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email de contato"
              type="email"
              value={config.academyEmail}
              onChange={(e) => update('academyEmail', e.target.value)}
            />
            <Input
              label="Telefone"
              value={config.academyPhone}
              onChange={(e) => update('academyPhone', e.target.value)}
            />
          </div>
          <Input
            label="Endereço"
            value={config.academyAddress}
            onChange={(e) => update('academyAddress', e.target.value)}
          />
        </CardBody>
      </Card>

      {/* Preferências */}
      <Card className="mb-5">
        <CardHeader title="Preferências" subtitle="Formatação, fuso horário e idioma" />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Fuso horário"
              value={config.timezone}
              onChange={(e) => update('timezone', e.target.value)}
              options={[
                { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
                { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
                { value: 'America/Fortaleza', label: 'Fortaleza (GMT-3)' },
              ]}
            />
            <Select
              label="Moeda"
              value={config.currency}
              onChange={(e) => update('currency', e.target.value)}
              options={[
                { value: 'BRL', label: 'Real (R$)' },
                { value: 'USD', label: 'Dólar (US$)' },
                { value: 'EUR', label: 'Euro (€)' },
              ]}
            />
          </div>
        </CardBody>
      </Card>

      {/* Notificações */}
      <Card className="mb-5">
        <CardHeader title="Notificações" subtitle="Alertas automáticos" />
        <CardBody className="divide-y divide-gray-100">
          {[
            { key: 'notifyExpiring',   title: 'Matrículas vencendo',  desc: 'Aviso 7 dias antes do vencimento' },
            { key: 'notifyDenied',     title: 'Check-ins negados',    desc: 'Quando um aluno tiver entrada negada' },
            { key: 'notifyNewStudent', title: 'Novos alunos',         desc: 'Quando um aluno se cadastrar' },
            { key: 'notifyWeekly',     title: 'Resumo semanal',       desc: 'Email com resumo semanal' },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <div className="text-[13.5px] font-semibold text-gray-800">{n.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{n.desc}</div>
              </div>
              <Toggle checked={config[n.key]} onChange={(v) => update(n.key, v)} />
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Segurança */}
      <Card className="mb-5">
        <CardHeader title="Segurança" subtitle="Políticas de acesso" />
        <CardBody>
          <Input
            label="Timeout de sessão (minutos)"
            type="number"
            min="5"
            max="1440"
            value={config.sessionTimeout}
            onChange={(e) => update('sessionTimeout', Number(e.target.value) || 60)}
            hint="Tempo de inatividade antes de exigir novo login"
          />
          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-[13.5px] font-semibold text-gray-800">Exigir senha forte</div>
                <div className="text-xs text-gray-500 mt-0.5">Letras maiúsculas, minúsculas, números e símbolos</div>
              </div>
              <Toggle
                checked={config.requireStrongPassword}
                onChange={(v) => update('requireStrongPassword', v)}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sistema (readonly) */}
      <Card className="mb-5">
        <CardHeader title="Sistema" subtitle="Informações técnicas" />
        <CardBody>
          <div className={`rounded-lg p-4 flex items-center gap-3 mb-4 ${
            health.status === 'ok' ? 'bg-triad-50 border border-triad-100' :
            health.status === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
              health.status === 'ok' ? 'bg-triad-500 animate-pulse-soft' :
              health.status === 'error' ? 'bg-red-500' :
              'bg-gray-300'
            }`} />
            <div className="flex-1">
              <div className={`text-[13.5px] font-bold ${
                health.status === 'ok' ? 'text-triad-900' :
                health.status === 'error' ? 'text-red-800' :
                'text-gray-800'
              }`}>
                {health.status === 'ok' ? 'Sistema operacional' :
                 health.status === 'error' ? 'Erro de conexão' :
                 'Verificando...'}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                {health.status !== 'checking' && `${health.ms}ms · ${new Date(health.ts).toLocaleString('pt-BR')}`}
              </div>
            </div>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={checkHealth}>
              Testar
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Versão do sistema" value="v3.0" readOnly disabled />
            <Input label="Endpoint da API" value={api.defaults.baseURL} readOnly disabled />
          </div>
        </CardBody>
      </Card>

      {/* Danger zone */}
      <Card className="mb-5 !bg-red-50 !border-red-200">
        <CardBody className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-bold text-red-800">Resetar configurações locais</div>
            <div className="text-xs text-red-700 mt-0.5">Apaga configs salvas neste navegador</div>
          </div>
          <Button variant="danger" icon={Trash2} onClick={() => setConfirmReset(true)}>
            Resetar
          </Button>
        </CardBody>
      </Card>

      {/* Save bar */}
      <div className="sticky bottom-4 z-30 flex justify-end gap-3 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
        <div className={`flex-1 flex items-center gap-2 text-[12.5px] ${dirty ? 'text-amber-600' : 'text-gray-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dirty ? 'bg-amber-500' : 'bg-triad-500'}`} />
          {dirty ? 'Alterações não salvas' : 'Tudo salvo'}
        </div>
        <Button variant="outline" onClick={() => { setConfig({ ...config }); setDirty(false); }}>
          Descartar
        </Button>
        <Button icon={Save} onClick={handleSave} disabled={!dirty}>
          Salvar alterações
        </Button>
      </div>

      <ConfirmModal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleReset}
        title="Resetar configurações"
        message="Isso vai apagar TODAS as configurações salvas neste navegador. Continuar?"
        confirmLabel="Resetar"
      />
    </>
  );
}