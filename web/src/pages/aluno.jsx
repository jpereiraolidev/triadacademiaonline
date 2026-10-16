import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dumbbell, TrendingUp, Calendar, User, Activity, CheckCircle2,
  XCircle, Clock, Mail, Phone, Cake, Shield, ChevronRight,
  BarChart3, Award, Target, ArrowRight,
} from 'lucide-react';
import { api, getErrorMessage, getUser } from '../api';
import {
  Button, Input, Badge, Card, CardHeader, CardBody,
  Table, THead, TH, TBody, TR, TD, Avatar, EmptyState,
  Skeleton, Modal, PageHeader,
} from '../ui';
import {
  formatNumber, formatDate, formatDateTime, formatDuration,
  daysUntil, roleLabel,
} from '../format';

// ============================================
// HELPERS
// ============================================
const MUSCLE_GROUPS = {
  PEITO: 'Peito', COSTAS: 'Costas', PERNAS: 'Pernas', OMBROS: 'Ombros',
  BICEPS: 'Bíceps', TRICEPS: 'Tríceps', ABDOMEN: 'Abdômen',
  GLUTEOS: 'Glúteos', CARDIO: 'Cardio',
};

// ============================================
// 1. DASHBOARD DO ALUNO
// ============================================
export function AlunoDashboard() {
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [membership, setMembership] = useState(null);
  const [stats, setStats] = useState({ checkinsMes: 0, treinosAtivos: 0 });

  const user = getUser();
  const studentId = user?.studentId || user?.student?.id;

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    if (!studentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [workoutsRes, checkinsRes, membershipsRes] = await Promise.all([
        api.get(`/students/${studentId}/workouts`).catch(() => ({ data: [] })),
        api.get(`/checkins?studentId=${studentId}&limit=500`).catch(() => ({ data: [] })),
        api.get(`/memberships?studentId=${studentId}`).catch(() => ({ data: [] })),
      ]);

      const wList = workoutsRes.data || [];
      const cList = checkinsRes.data || [];
      const mList = membershipsRes.data || [];

      const activeWorkouts = wList.filter((w) => w.status !== 'ARQUIVADO');
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      const checkinsMes = cList.filter((c) => new Date(c.createdAt) >= inicioMes).length;

      const ativa = mList
        .filter((m) => m.status === 'ATIVA')
        .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];

      setWorkouts(activeWorkouts);
      setCheckins(cList);
      setMembership(ativa || null);
      setStats({
        checkinsMes,
        treinosAtivos: activeWorkouts.length,
      });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar dados'));
    } finally {
      setLoading(false);
    }
  }

  if (!studentId) {
    return (
      <Card>
        <EmptyState
          icon={User}
          title="Perfil incompleto"
          description="Sua conta ainda não foi vinculada a um cadastro de aluno. Fale com a recepção."
        />
      </Card>
    );
  }

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const diasRestantes = membership ? daysUntil(membership.endDate) : null;

  // Status da matrícula
  let statusPill = null;
  if (membership) {
    if (diasRestantes > 7) {
      statusPill = { variant: 'success', label: 'Matrícula ativa' };
    } else if (diasRestantes > 0) {
      statusPill = { variant: 'warning', label: `Vence em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}` };
    } else {
      statusPill = { variant: 'danger', label: 'Matrícula vencida' };
    }
  } else {
    statusPill = { variant: 'danger', label: 'Sem matrícula ativa' };
  }

  return (
    <>
      {/* Hero */}
      <div
        className="rounded-xl p-6 mb-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f3d2e 0%, #1a6b4f 100%)' }}
      >
        <div className="relative z-10">
          <h2 className="text-xl font-bold tracking-tight mb-1">
            {saudacao}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-[13.5px] opacity-85 mb-3">
            {loading ? 'Carregando suas informações...' :
              `Você tem ${stats.treinosAtivos} treino${stats.treinosAtivos === 1 ? '' : 's'} ativo${stats.treinosAtivos === 1 ? '' : 's'} e ${stats.checkinsMes} check-in${stats.checkinsMes === 1 ? '' : 's'} este mês.`}
          </p>
          {statusPill && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur ${
              statusPill.variant === 'success' ? 'bg-triad-500/30' :
              statusPill.variant === 'warning' ? 'bg-amber-500/30' :
              'bg-red-500/30'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              {statusPill.label}
            </span>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-triad-50 text-triad-700 flex items-center justify-center flex-shrink-0">
              <Dumbbell style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">Treinos ativos</div>
              <div className="text-[28px] font-extrabold tracking-tight leading-tight mt-1">
                {loading ? <Skeleton variant="value" /> : formatNumber(stats.treinosAtivos)}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Activity style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">Check-ins no mês</div>
              <div className="text-[28px] font-extrabold tracking-tight leading-tight mt-1">
                {loading ? <Skeleton variant="value" /> : formatNumber(stats.checkinsMes)}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Target style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">Plano atual</div>
              <div className="text-[15px] font-extrabold tracking-tight leading-tight mt-1 truncate">
                {loading ? <Skeleton variant="text" /> : membership?.plan?.name || '—'}
              </div>
              {membership?.plan?.durationDays && (
                <div className="text-xs text-gray-500 mt-0.5">{formatDuration(membership.plan.durationDays)}</div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Calendar style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">Vence em</div>
              <div className="text-[22px] font-extrabold tracking-tight leading-tight mt-1">
                {loading ? <Skeleton variant="value" /> :
                  diasRestantes === null ? '—' :
                  diasRestantes > 0 ? `${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}` :
                  'Vencida'}
              </div>
              {membership?.endDate && (
                <div className="text-xs text-gray-500 mt-0.5">{formatDate(membership.endDate)}</div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Treino ativo */}
        <Card>
          <CardHeader
            title="Meu treino ativo"
            subtitle="Plano em andamento"
            action={
              <a href="/aluno/workouts" className="text-xs text-triad-700 font-medium hover:underline">Ver todos →</a>
            }
          />
          {loading ? (
            <CardBody><Skeleton variant="block" /></CardBody>
          ) : workouts.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="Nenhum treino ativo"
              description="Fale com seu professor para criar um plano."
            />
          ) : (
            <CardBody>
              {(() => {
                const w = workouts[0];
                const exs = (w.exercises || []).slice(0, 5);
                return (
                  <div className="bg-triad-50 border border-triad-100 rounded-lg p-4">
                    <div className="text-base font-bold text-triad-900 mb-1">{w.name}</div>
                    {w.description && (
                      <div className="text-xs text-gray-600 mb-3">{w.description}</div>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-3 pb-3 border-b border-triad-100">
                      <span>📅 Início: {formatDate(w.startDate)}</span>
                      <span>💪 {(w.exercises || []).length} exercícios</span>
                    </div>
                    {exs.length > 0 ? (
                      <div className="space-y-1.5">
                        {exs.map((ex, i) => (
                          <div key={ex.id || i} className="flex items-center gap-2.5 bg-white rounded-md p-2.5">
                            <div className="w-6 h-6 rounded-full bg-triad-100 text-triad-800 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium truncate">{ex.exercise?.name}</div>
                              <div className="text-[11px] text-gray-500">
                                {ex.sets && `${ex.sets}x`}{ex.repetitions || ''}
                                {ex.weight && ` · ${ex.weight}kg`}
                              </div>
                            </div>
                          </div>
                        ))}
                        {(w.exercises || []).length > 5 && (
                          <div className="text-xs text-gray-500 text-center pt-1">
                            + {(w.exercises || []).length - 5} exercícios
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 text-center py-2">
                        Nenhum exercício neste treino
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardBody>
          )}
        </Card>

        {/* Últimos check-ins */}
        <Card>
          <CardHeader
            title="Meus últimos check-ins"
            subtitle="Registros recentes"
            action={
              <a href="/aluno/checkins" className="text-xs text-triad-700 font-medium hover:underline">Ver todos →</a>
            }
          />
          {loading ? (
            <CardBody><Skeleton variant="block" /></CardBody>
          ) : checkins.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Nenhum check-in ainda"
              description="Quando você entrar na academia, aparecerá aqui."
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {checkins.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    c.status === 'AUTORIZADO' ? 'bg-triad-100 text-triad-700' : 'bg-red-100 text-red-500'
                  }`}>
                    {c.status === 'AUTORIZADO' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium">{c.type || '—'}</div>
                    <div className="text-xs text-gray-500">{formatDateTime(c.createdAt)}</div>
                  </div>
                  <Badge variant={c.status === 'AUTORIZADO' ? 'success' : 'danger'}>
                    {c.status === 'AUTORIZADO' ? 'OK' : 'Negado'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

// ============================================
// 2. MEUS TREINOS
// ============================================
export function AlunoWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState(null);

  const user = getUser();
  const studentId = user?.studentId || user?.student?.id;

  useEffect(() => { loadWorkouts(); }, []);

  async function loadWorkouts() {
    if (!studentId) { setLoading(false); return; }
    try {
      const { data } = await api.get(`/students/${studentId}/workouts`);
      setWorkouts(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar treinos'));
    } finally {
      setLoading(false);
    }
  }

  const ativos = workouts.filter((w) => w.status !== 'ARQUIVADO');
  const arquivados = workouts.filter((w) => w.status === 'ARQUIVADO');

  return (
    <>
      <PageHeader
        title="Meus treinos"
        subtitle="Seus planos de treino ativos e histórico."
      />

      {loading ? (
        <Card><CardBody><Skeleton variant="block" /></CardBody></Card>
      ) : ativos.length === 0 && arquivados.length === 0 ? (
        <Card>
          <EmptyState
            icon={Dumbbell}
            title="Nenhum treino ainda"
            description="Fale com seu professor para montar um plano."
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {/* Treinos ativos */}
          {ativos.length > 0 && (
            <div>
              <div className="text-sm font-bold text-gray-700 mb-3">Treinos ativos</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ativos.map((w) => (
                  <WorkoutCard key={w.id} workout={w} onClick={() => setDetailModal(w)} />
                ))}
              </div>
            </div>
          )}

          {/* Arquivados */}
          {arquivados.length > 0 && (
            <div>
              <div className="text-sm font-bold text-gray-700 mb-3">Histórico</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {arquivados.map((w) => (
                  <WorkoutCard key={w.id} workout={w} onClick={() => setDetailModal(w)} archived />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal detalhes */}
      <Modal
        open={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={detailModal?.name}
        subtitle={detailModal ? `${(detailModal.exercises || []).length} exercícios` : ''}
        size="lg"
        footer={<Button onClick={() => setDetailModal(null)}>Fechar</Button>}
      >
        {detailModal && (
          <div>
            {detailModal.description && (
              <div className="bg-gray-50 rounded-lg p-3 text-[13px] text-gray-600 mb-4">
                {detailModal.description}
              </div>
            )}

            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
              <span>📅 Início: {formatDate(detailModal.startDate)}</span>
              {detailModal.endDate && <span>🏁 Fim: {formatDate(detailModal.endDate)}</span>}
            </div>

            {(detailModal.exercises || []).length === 0 ? (
              <EmptyState icon={Dumbbell} title="Sem exercícios" description="Este treino não tem exercícios." />
            ) : (
              <div className="space-y-2">
                {detailModal.exercises.map((ex, i) => (
                  <div key={ex.id || i} className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-triad-100 text-triad-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-semibold">{ex.exercise?.name}</div>
                        <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                          {ex.sets && <span>🔢 {ex.sets} séries</span>}
                          {ex.repetitions && <span>🔁 {ex.repetitions} reps</span>}
                          {ex.weight && <span>⚖️ {ex.weight} kg</span>}
                          {ex.restSeconds && <span>⏱️ {ex.restSeconds}s descanso</span>}
                        </div>
                        {ex.notes && (
                          <div className="text-xs text-gray-400 mt-1.5 italic">{ex.notes}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

// ---------- WorkoutCard (usado na lista) ----------
function WorkoutCard({ workout, onClick, archived = false }) {
  const exs = workout.exercises || [];
  return (
    <button
      onClick={onClick}
      className={`text-left bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-triad-200 transition p-5 ${
        archived ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-gray-900 truncate">{workout.name}</div>
          {workout.description && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{workout.description}</div>
          )}
        </div>
        <Badge variant={archived ? 'neutral' : 'success'}>
          {archived ? 'Arquivado' : 'Ativo'}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
        <span>📅 {formatDate(workout.startDate)}</span>
        <span>💪 {exs.length} exercícios</span>
      </div>

      {exs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {exs.slice(0, 4).map((ex, i) => (
            <span key={i} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {ex.exercise?.name}
            </span>
          ))}
          {exs.length > 4 && (
            <span className="text-[11px] text-gray-400">+{exs.length - 4}</span>
          )}
        </div>
      )}
    </button>
  );
}

// ============================================
// 3. MINHA EVOLUÇÃO
// ============================================
export function AlunoEvolution() {
  const [evolution, setEvolution] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = getUser();
  const studentId = user?.studentId || user?.student?.id;

  useEffect(() => { loadEvolution(); }, []);

  async function loadEvolution() {
    if (!studentId) { setLoading(false); return; }
    try {
      const { data } = await api.get(`/students/${studentId}/evolution`);
      setEvolution(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar evolução'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Minha evolução"
        subtitle="Acompanhe seu progresso por exercício ao longo do tempo."
      />

      {loading ? (
        <Card><CardBody><Skeleton variant="block" /></CardBody></Card>
      ) : evolution.length === 0 ? (
        <Card>
          <EmptyState
            icon={TrendingUp}
            title="Sem histórico ainda"
            description="Conforme você completa treinos, sua evolução aparecerá aqui."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {evolution.map((ex) => {
            const history = ex.history || [];
            const first = history[0];
            const last = history[history.length - 1];
            const progressPct = first?.weight && last?.weight && first.weight > 0
              ? Math.round(((last.weight - first.weight) / first.weight) * 100)
              : null;

            return (
              <Card key={ex.exerciseId}>
                <CardHeader
                  title={ex.exerciseName}
                  subtitle={MUSCLE_GROUPS[ex.muscleGroup] || ex.muscleGroup || ''}
                  action={
                    progressPct !== null && (
                      <Badge variant={progressPct > 0 ? 'success' : progressPct < 0 ? 'danger' : 'neutral'}>
                        {progressPct > 0 ? '+' : ''}{progressPct}%
                      </Badge>
                    )
                  }
                />

                {/* Mini KPI */}
                {first && last && (
                  <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                    <div className="p-3 text-center">
                      <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Primeiro</div>
                      <div className="text-base font-bold text-gray-800">
                        {first.weight ? `${first.weight} kg` : '—'}
                      </div>
                    </div>
                    <div className="p-3 text-center">
                      <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Último</div>
                      <div className="text-base font-bold text-triad-700">
                        {last.weight ? `${last.weight} kg` : '—'}
                      </div>
                    </div>
                    <div className="p-3 text-center">
                      <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Registros</div>
                      <div className="text-base font-bold text-gray-800">{history.length}</div>
                    </div>
                  </div>
                )}

                <Table>
                  <THead>
                    <TR hover={false}>
                      <TH>Treino</TH>
                      <TH>Data</TH>
                      <TH>Séries</TH>
                      <TH>Reps</TH>
                      <TH>Peso</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {history.slice().reverse().map((h, i) => (
                      <TR key={i}>
                        <TD className="font-medium">{h.workoutName}</TD>
                        <TD>{formatDate(h.date)}</TD>
                        <TD>{h.sets || '—'}</TD>
                        <TD>{h.repetitions || '—'}</TD>
                        <TD>
                          {h.weight ? (
                            <Badge variant="success">{h.weight} kg</Badge>
                          ) : '—'}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

// ============================================
// 4. MEUS CHECK-INS
// ============================================
export function AlunoCheckins() {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const user = getUser();
  const studentId = user?.studentId || user?.student?.id;

  useEffect(() => { loadCheckins(); }, []);

  async function loadCheckins() {
    if (!studentId) { setLoading(false); return; }
    try {
      const { data } = await api.get(`/checkins?studentId=${studentId}&limit=500`);
      setCheckins(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar check-ins'));
    } finally {
      setLoading(false);
    }
  }

  const filtered = checkins.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const total = checkins.length;
  const autorizados = checkins.filter((c) => c.status === 'AUTORIZADO').length;
  const negados = checkins.filter((c) => c.status === 'NEGADO').length;
  const hora = new Date().getHours();

  // Frequência por hora
  const porHora = Array(24).fill(0);
  checkins.forEach((c) => {
    if (c.status === 'AUTORIZADO') {
      const h = new Date(c.createdAt).getHours();
      porHora[h]++;
    }
  });
  const horaFrequente = porHora.indexOf(Math.max(...porHora));

  return (
    <>
      <PageHeader
        title="Meus check-ins"
        subtitle="Histórico completo das suas entradas na academia."
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-triad-50 text-triad-700 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">Total autorizados</div>
              <div className="text-[28px] font-extrabold tracking-tight leading-tight mt-1">
                {loading ? <Skeleton variant="value" /> : formatNumber(autorizados)}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0">
              <XCircle style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">Negados</div>
              <div className="text-[28px] font-extrabold tracking-tight leading-tight mt-1">
                {loading ? <Skeleton variant="value" /> : formatNumber(negados)}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">Horário frequente</div>
              <div className="text-[28px] font-extrabold tracking-tight leading-tight mt-1">
                {loading ? <Skeleton variant="value" /> : `${String(horaFrequente).padStart(2, '0')}h`}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        {/* Filtros */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'AUTORIZADO', label: 'Autorizados' },
              { value: 'NEGADO', label: 'Negados' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3.5 py-1.5 text-[13px] font-semibold rounded-md transition ${
                  filter === f.value ? 'bg-white text-triad-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <CardBody><Skeleton variant="block" /></CardBody>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Activity}
            title={checkins.length === 0 ? 'Nenhum check-in' : 'Nenhum resultado'}
            description={checkins.length === 0 ? 'Seus registros de entrada aparecerão aqui.' : 'Ajuste o filtro acima.'}
          />
        ) : (
          <Table>
            <THead>
              <TR hover={false}>
                <TH>Data/Hora</TH>
                <TH>Tipo</TH>
                <TH>Status</TH>
                <TH>Motivo</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((c) => (
                <TR key={c.id}>
                  <TD>
                    <div className="font-medium">{formatDateTime(c.createdAt)}</div>
                    <div className="text-xs text-gray-500">{formatDate(c.createdAt)}</div>
                  </TD>
                  <TD>
                    <Badge variant={c.type === 'ENTRADA' ? 'info' : 'neutral'}>
                      {c.type || '—'}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge variant={c.status === 'AUTORIZADO' ? 'success' : 'danger'} dot>
                      {c.status === 'AUTORIZADO' ? 'Autorizado' : 'Negado'}
                    </Badge>
                  </TD>
                  <TD className="text-xs text-gray-500">{c.reason || '—'}</TD>
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
// 5. MEU PERFIL
// ============================================
export function AlunoProfile() {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [membership, setMembership] = useState(null);
  const [checkinCount, setCheckinCount] = useState(0);

  const user = getUser();
  const studentId = user?.studentId || user?.student?.id;

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    if (!studentId) { setLoading(false); return; }
    try {
      const [studentRes, membershipsRes, checkinsRes] = await Promise.all([
        api.get(`/students/${studentId}`).catch(() => ({ data: null })),
        api.get(`/memberships?studentId=${studentId}`).catch(() => ({ data: [] })),
        api.get(`/checkins?studentId=${studentId}&limit=500`).catch(() => ({ data: [] })),
      ]);

      setStudent(studentRes.data);
      const ativa = (membershipsRes.data || [])
        .filter((m) => m.status === 'ATIVA')
        .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];
      setMembership(ativa || null);
      setCheckinCount((checkinsRes.data || []).filter((c) => c.status === 'AUTORIZADO').length);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar perfil'));
    } finally {
      setLoading(false);
    }
  }

  const memberSince = student?.createdAt;

  return (
    <>
      <PageHeader
        title="Meu perfil"
        subtitle="Seus dados pessoais e informações da conta."
      />

      {/* Header card */}
      <Card className="mb-5">
        <CardBody>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar name={student?.name || user?.name} size="lg" className="!w-20 !h-20 !text-2xl" />
            <div className="flex-1">
              <div className="text-xl font-bold text-gray-900 mb-1">
                {loading ? <Skeleton variant="title" /> : (student?.name || user?.name)}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                {loading ? <Skeleton variant="text" /> : (student?.email || user?.email)}
              </div>
              <Badge variant="aluno">Aluno</Badge>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dados pessoais */}
        <Card>
          <CardHeader title="Dados pessoais" subtitle="Suas informações cadastrais" />
          <CardBody>
            {loading ? (
              <Skeleton variant="block" />
            ) : (
              <div className="space-y-4">
                <ProfileField icon={User} label="Nome completo" value={student?.name || user?.name} />
                <ProfileField icon={Mail} label="Email" value={student?.email || user?.email} />
                <ProfileField icon={Phone} label="Telefone" value={student?.phone} />
                <ProfileField
                  icon={Cake}
                  label="Data de nascimento"
                  value={student?.birthDate ? formatDate(student.birthDate) : null}
                />
                <ProfileField
                  icon={Calendar}
                  label="Cliente desde"
                  value={memberSince ? formatDate(memberSince) : null}
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Plano e estatísticas */}
        <div className="space-y-4">
          {/* Plano atual */}
          <Card>
            <CardHeader title="Plano atual" subtitle="Sua matrícula" />
            <CardBody>
              {loading ? (
                <Skeleton variant="block" />
              ) : membership ? (
                <>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="text-lg font-bold text-triad-800">
                        {membership.plan?.name || '—'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {membership.plan?.durationDays ? formatDuration(membership.plan.durationDays) : '—'}
                      </div>
                    </div>
                    <Badge variant={daysUntil(membership.endDate) > 7 ? 'success' : 'warning'}>
                      {daysUntil(membership.endDate) > 0
                        ? `${daysUntil(membership.endDate)} dias restantes`
                        : 'Vencida'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Início</div>
                      <div className="text-sm font-semibold">{formatDate(membership.startDate)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Vencimento</div>
                      <div className="text-sm font-semibold">{formatDate(membership.endDate)}</div>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={Shield}
                  title="Sem matrícula ativa"
                  description="Fale com a recepção para ativar seu plano."
                />
              )}
            </CardBody>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader title="Minhas estatísticas" />
            <CardBody>
              {loading ? (
                <Skeleton variant="block" />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-triad-50 rounded-lg">
                    <Award className="w-6 h-6 mx-auto mb-2 text-triad-700" />
                    <div className="text-2xl font-extrabold text-triad-900">{checkinCount}</div>
                    <div className="text-[11px] text-triad-700 uppercase tracking-wide mt-1">
                      Check-ins
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-extrabold text-blue-900">
                      {memberSince ? Math.floor((new Date() - new Date(memberSince)) / (1000 * 60 * 60 * 24)) : 0}
                    </div>
                    <div className="text-[11px] text-blue-700 uppercase tracking-wide mt-1">
                      Dias como aluno
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

// ---------- ProfileField ----------
function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-[13.5px] font-medium text-gray-900 truncate">
          {value || <span className="text-gray-400 italic">Não informado</span>}
        </div>
      </div>
    </div>
  );
}