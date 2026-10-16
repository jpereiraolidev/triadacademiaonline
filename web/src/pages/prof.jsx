import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Users, Dumbbell, TrendingUp, Plus, Search, Edit, Trash2,
  ChevronRight, Activity, Target, X, Check, Video, Save,
} from 'lucide-react';
import { api, getErrorMessage, getUser } from '../api';
import {
  Button, Input, Select, Textarea, Badge, Card, CardHeader, CardBody,
  Table, THead, TH, TBody, TR, TD, Avatar, Spinner, EmptyState,
  Skeleton, Modal, ConfirmModal, PageHeader,
} from '../ui';
import {
  formatNumber, formatDate, formatDateTime, formatDuration,
  daysUntil, initials,
} from '../format';

// ============================================
// HELPERS
// ============================================
const MUSCLE_GROUPS = [
  { value: 'PEITO', label: 'Peito' },
  { value: 'COSTAS', label: 'Costas' },
  { value: 'PERNAS', label: 'Pernas' },
  { value: 'OMBROS', label: 'Ombros' },
  { value: 'BICEPS', label: 'Bíceps' },
  { value: 'TRICEPS', label: 'Tríceps' },
  { value: 'ABDOMEN', label: 'Abdômen' },
  { value: 'GLUTEOS', label: 'Glúteos' },
  { value: 'CARDIO', label: 'Cardio' },
];

// ============================================
// 1. DASHBOARD PROFESSOR
// ============================================
export function ProfDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ students: 0, workouts: 0, exercises: 0 });
  const [students, setStudents] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const user = getUser();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [studentsRes, exercisesRes] = await Promise.all([
        api.get('/students?active=true').catch(() => ({ data: [] })),
        api.get('/exercises').catch(() => ({ data: [] })),
      ]);

      const studentsList = studentsRes.data || [];
      const exercises = exercisesRes.data || [];

      // Carrega workouts dos primeiros alunos
      const workoutsPromises = studentsList.slice(0, 20).map((s) =>
        api.get(`/students/${s.id}/workouts`).catch(() => ({ data: [] }))
      );
      const workoutsResults = await Promise.all(workoutsPromises);

      const allWorkouts = [];
      workoutsResults.forEach((r, i) => {
        (r.data || []).forEach((w) => {
          allWorkouts.push({ ...w, student: studentsList[i] });
        });
      });

      allWorkouts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setStats({
        students: studentsList.length,
        workouts: allWorkouts.filter((w) => w.status !== 'ARQUIVADO').length,
        exercises: exercises.filter((e) => e.active !== false).length,
      });
      setStudents(studentsList.slice(0, 6));
      setRecentWorkouts(allWorkouts.slice(0, 5));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar'));
    } finally {
      setLoading(false);
    }
  }

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <>
      {/* Hero */}
      <div
        className="rounded-xl p-6 mb-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f3d2e 0%, #1a6b4f 100%)' }}
      >
        <div className="relative z-10">
          <h2 className="text-xl font-bold tracking-tight mb-1">
            {saudacao}, Prof. {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-[13.5px] opacity-85">
            Você acompanha <strong>{stats.students}</strong> alunos com <strong>{stats.workouts}</strong> treinos ativos.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-triad-50 text-triad-700 flex items-center justify-center flex-shrink-0">
              <Users style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">Alunos</div>
              <div className="text-[28px] font-extrabold tracking-tight leading-tight mt-1">
                {loading ? <Skeleton variant="value" /> : formatNumber(stats.students)}
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Dumbbell style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">Treinos ativos</div>
              <div className="text-[28px] font-extrabold tracking-tight leading-tight mt-1">
                {loading ? <Skeleton variant="value" /> : formatNumber(stats.workouts)}
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
              <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">Exercícios</div>
              <div className="text-[28px] font-extrabold tracking-tight leading-tight mt-1">
                {loading ? <Skeleton variant="value" /> : formatNumber(stats.exercises)}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Meus alunos */}
        <Card>
          <CardHeader title="Meus alunos" subtitle="Alunos ativos" action={
            <a href="/prof/students" className="text-xs text-triad-700 font-medium hover:underline">Ver todos →</a>
          } />
          {loading ? (
            <CardBody><Skeleton variant="block" /></CardBody>
          ) : students.length === 0 ? (
            <EmptyState icon={Users} title="Sem alunos" description="Nenhum aluno ativo." />
          ) : (
            <div className="divide-y divide-gray-100">
              {students.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={s.name} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold truncate">{s.name}</div>
                    <div className="text-xs text-gray-500 truncate">{s.email || '—'}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Treinos recentes */}
        <Card>
          <CardHeader title="Treinos recentes" subtitle="Últimos planos criados" action={
            <a href="/prof/workouts" className="text-xs text-triad-700 font-medium hover:underline">Ver todos →</a>
          } />
          {loading ? (
            <CardBody><Skeleton variant="block" /></CardBody>
          ) : recentWorkouts.length === 0 ? (
            <EmptyState icon={Dumbbell} title="Sem treinos" description="Nenhum treino criado ainda." />
          ) : (
            <div className="divide-y divide-gray-100">
              {recentWorkouts.map((w) => (
                <div key={w.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold truncate">{w.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {w.student?.name} · {formatDate(w.startDate)}
                    </div>
                  </div>
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
// 2. MEUS ALUNOS
// ============================================
export function ProfStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadStudents(); }, []);

  async function loadStudents() {
    setLoading(true);
    try {
      const { data } = await api.get('/students?active=true');
      setStudents(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar'));
    } finally {
      setLoading(false);
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
        title="Meus alunos"
        subtitle="Alunos ativos da academia."
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
          <EmptyState icon={Users} title="Nenhum aluno" description="Nenhum aluno encontrado." />
        ) : (
          <Table>
            <THead>
              <TR hover={false}>
                <TH>Aluno</TH>
                <TH>Contato</TH>
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
                  <TD align="right">
                    <div className="flex gap-2 justify-end">
                      <a
                        href={`/prof/workouts?studentId=${s.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-triad-700 bg-triad-50 hover:bg-triad-100 transition"
                      >
                        <Dumbbell className="w-3.5 h-3.5" />
                        Treinos
                      </a>
                      <a
                        href={`/prof/evolution?studentId=${s.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Evolução
                      </a>
                    </div>
                  </TD>
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
// 3. TREINOS
// ============================================
export function ProfWorkouts() {
  const [students, setStudents] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    exercises: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadInitial(); }, []);
  useEffect(() => { if (selectedStudent) loadWorkouts(); }, [selectedStudent]);

  async function loadInitial() {
    try {
      const [studentsRes, exercisesRes] = await Promise.all([
        api.get('/students?active=true'),
        api.get('/exercises'),
      ]);
      const studentsList = studentsRes.data || [];
      setStudents(studentsList);
      setExercises(exercisesRes.data || []);
      if (studentsList.length > 0) setSelectedStudent(studentsList[0].id);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar'));
    } finally {
      setLoading(false);
    }
  }

  async function loadWorkouts() {
    setLoading(true);
    try {
      const { data } = await api.get(`/students/${selectedStudent}/workouts`);
      setWorkouts(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar treinos'));
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({
      name: '',
      description: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      exercises: [],
    });
    setModalOpen(true);
  }

  function addExercise() {
    setForm({
      ...form,
      exercises: [
        ...form.exercises,
        { exerciseId: '', sets: 3, repetitions: 12, weight: null, restSeconds: 60, notes: '' },
      ],
    });
  }

  function updateExercise(index, field, value) {
    const updated = [...form.exercises];
    updated[index][field] = value;
    setForm({ ...form, exercises: updated });
  }

  function removeExercise(index) {
    setForm({ ...form, exercises: form.exercises.filter((_, i) => i !== index) });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || form.name.length < 2) return toast.error('Nome do treino obrigatório');
    if (!selectedStudent) return toast.error('Selecione um aluno');

    setSaving(true);
    try {
      const body = {
        name: form.name,
        startDate: form.startDate,
        ...(form.description && { description: form.description }),
        ...(form.endDate && { endDate: form.endDate }),
        ...(form.exercises.length > 0 && {
          exercises: form.exercises
            .filter((e) => e.exerciseId)
            .map((e, idx) => ({
              exerciseId: e.exerciseId,
              order: idx,
              ...(e.sets && { sets: Number(e.sets) }),
              ...(e.repetitions && { repetitions: Number(e.repetitions) }),
              ...(e.weight && { weight: Number(e.weight) }),
              ...(e.restSeconds && { restSeconds: Number(e.restSeconds) }),
              ...(e.notes && { notes: e.notes }),
            })),
        }),
      };

      await api.post(`/students/${selectedStudent}/workouts`, body);
      toast.success('Treino criado!');
      setModalOpen(false);
      loadWorkouts();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao salvar'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/workouts/${confirmDelete.id}`);
      toast.success('Treino arquivado');
      setConfirmDelete(null);
      setDetailModal(null);
      loadWorkouts();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao arquivar'));
    }
  }

  return (
    <>
      <PageHeader
        title="Treinos"
        subtitle="Crie e gerencie planos de treino para seus alunos."
        action={<Button icon={Plus} onClick={openCreate} disabled={!selectedStudent}>Novo treino</Button>}
      />

      {/* Seletor de aluno */}
      <Card className="mb-5">
        <CardBody>
          <Select
            label="Aluno"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            options={[
              { value: '', label: 'Selecione um aluno...' },
              ...students.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        </CardBody>
      </Card>

      {/* Lista de treinos */}
      {loading ? (
        <Card><CardBody><Skeleton variant="block" /></CardBody></Card>
      ) : workouts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Dumbbell}
            title="Nenhum treino"
            description={selectedStudent ? 'Crie o primeiro treino deste aluno.' : 'Selecione um aluno.'}
            action={selectedStudent && <Button icon={Plus} onClick={openCreate}>Novo treino</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workouts.map((w) => (
            <Card key={w.id} className={w.status === 'ARQUIVADO' ? 'opacity-60' : ''}>
              <CardBody>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold text-gray-900 truncate">{w.name}</div>
                    {w.description && (
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{w.description}</div>
                    )}
                  </div>
                  <Badge variant={w.status === 'ARQUIVADO' ? 'neutral' : 'success'}>
                    {w.status === 'ARQUIVADO' ? 'Arquivado' : 'Ativo'}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                  <span>📅 Início: {formatDate(w.startDate)}</span>
                  {w.endDate && <span>🏁 Fim: {formatDate(w.endDate)}</span>}
                  <span>💪 {(w.exercises || []).length} exercícios</span>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDetailModal(w)}
                    className="flex-1"
                  >
                    Ver detalhes
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDelete(w)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Modal criar treino */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo treino"
        subtitle="Defina os dados e exercícios do plano."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Criar treino</Button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <Input
            label="Nome do treino"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Treino A - Peito e Tríceps"
            required
          />
          <Textarea
            label="Descrição (opcional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Ex: Foco em hipertrofia, 3x semana"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Data de início"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
            <Input
              label="Data de fim (opcional)"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          {/* Exercícios */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[13.5px] font-bold text-gray-800">
                Exercícios ({form.exercises.length})
              </div>
              <Button size="sm" variant="outline" icon={Plus} onClick={addExercise}>
                Adicionar
              </Button>
            </div>

            {form.exercises.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">
                Nenhum exercício adicionado ainda
              </div>
            ) : (
              <div className="space-y-3">
                {form.exercises.map((ex, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 relative">
                    <button
                      type="button"
                      onClick={() => removeExercise(idx)}
                      className="absolute top-2 right-2 w-6 h-6 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="text-[11px] font-bold text-gray-500 mb-2">#{idx + 1}</div>

                    <Select
                      value={ex.exerciseId}
                      onChange={(e) => updateExercise(idx, 'exerciseId', e.target.value)}
                      options={[
                        { value: '', label: 'Selecione o exercício...' },
                        ...exercises.map((e) => ({ value: e.id, label: e.name })),
                      ]}
                    />

                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <Input
                        label="Séries"
                        type="number"
                        min="1"
                        value={ex.sets || ''}
                        onChange={(e) => updateExercise(idx, 'sets', e.target.value)}
                      />
                      <Input
                        label="Reps"
                        type="number"
                        min="1"
                        value={ex.repetitions || ''}
                        onChange={(e) => updateExercise(idx, 'repetitions', e.target.value)}
                      />
                      <Input
                        label="Peso (kg)"
                        type="number"
                        step="0.5"
                        min="0"
                        value={ex.weight || ''}
                        onChange={(e) => updateExercise(idx, 'weight', e.target.value)}
                      />
                      <Input
                        label="Desc. (s)"
                        type="number"
                        min="0"
                        value={ex.restSeconds || ''}
                        onChange={(e) => updateExercise(idx, 'restSeconds', e.target.value)}
                      />
                    </div>
                    <Input
                      placeholder="Observações (opcional)"
                      value={ex.notes || ''}
                      onChange={(e) => updateExercise(idx, 'notes', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </Modal>

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
              <span>📅 {formatDate(detailModal.startDate)}</span>
              {detailModal.endDate && <span>até {formatDate(detailModal.endDate)}</span>}
            </div>

            {(detailModal.exercises || []).length === 0 ? (
              <EmptyState icon={Dumbbell} title="Sem exercícios" description="Este treino não tem exercícios." />
            ) : (
              <div className="space-y-2">
                {detailModal.exercises.map((ex, i) => (
                  <div key={ex.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-triad-100 text-triad-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-semibold truncate">{ex.exercise?.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {ex.sets && `${ex.sets}x`}{ex.repetitions || ''}
                        {ex.weight && ` · ${ex.weight}kg`}
                        {ex.restSeconds && ` · ${ex.restSeconds}s descanso`}
                      </div>
                      {ex.notes && <div className="text-xs text-gray-400 mt-1 italic">{ex.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Arquivar treino"
        subtitle={confirmDelete?.name}
        message="O treino será arquivado e não aparecerá mais para o aluno. Você pode criar um novo depois."
        confirmLabel="Arquivar"
      />
    </>
  );
}

// ============================================
// 4. BIBLIOTECA DE EXERCÍCIOS
// ============================================
export function ProfExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', muscleGroup: '', videoUrl: '', active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadExercises(); }, []);

  async function loadExercises() {
    setLoading(true);
    try {
      const { data } = await api.get('/exercises');
      setExercises(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar exercícios'));
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '', muscleGroup: '', videoUrl: '', active: true });
    setModalOpen(true);
  }

  function openEdit(e) {
    setEditing(e);
    setForm({
      name: e.name || '',
      description: e.description || '',
      muscleGroup: e.muscleGroup || '',
      videoUrl: e.videoUrl || '',
      active: e.active !== false,
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || form.name.length < 2) return toast.error('Nome obrigatório');

    setSaving(true);
    try {
      const body = {
        name: form.name,
        ...(form.description && { description: form.description }),
        ...(form.muscleGroup && { muscleGroup: form.muscleGroup }),
        ...(form.videoUrl && { videoUrl: form.videoUrl }),
      };

      if (editing) {
        body.active = form.active;
        await api.patch(`/exercises/${editing.id}`, body);
        toast.success('Exercício atualizado!');
      } else {
        await api.post('/exercises', body);
        toast.success('Exercício criado!');
      }
      setModalOpen(false);
      loadExercises();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao salvar'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/exercises/${confirmDelete.id}`);
      toast.success('Exercício desativado');
      setConfirmDelete(null);
      loadExercises();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao desativar'));
    }
  }

  async function handleReactivate(e) {
    try {
      await api.patch(`/exercises/${e.id}`, { active: true });
      toast.success('Exercício reativado');
      loadExercises();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao reativar'));
    }
  }

  const filtered = exercises.filter((e) => {
    if (groupFilter && e.muscleGroup !== groupFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return e.name?.toLowerCase().includes(q);
  });

  return (
    <>
      <PageHeader
        title="Biblioteca de Exercícios"
        subtitle="Base de dados de exercícios disponíveis para montar treinos."
        action={<Button icon={Plus} onClick={openCreate}>Novo exercício</Button>}
      />

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[240px]">
            <Input
              icon={Search}
              placeholder="Buscar exercício..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos os grupos' },
              ...MUSCLE_GROUPS,
            ]}
            className="w-52"
          />
        </div>

        {loading ? (
          <CardBody><Skeleton variant="block" /></CardBody>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Dumbbell} title="Nenhum exercício" description="Ajuste os filtros ou cadastre o primeiro." />
        ) : (
          <Table>
            <THead>
              <TR hover={false}>
                <TH>Exercício</TH>
                <TH>Grupo</TH>
                <TH>Vídeo</TH>
                <TH>Status</TH>
                <TH align="right">Ações</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((ex) => (
                <TR key={ex.id}>
                  <TD>
                    <div className="font-semibold">{ex.name}</div>
                    {ex.description && (
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ex.description}</div>
                    )}
                  </TD>
                  <TD>
                    <Badge variant="info">
                      {MUSCLE_GROUPS.find((g) => g.value === ex.muscleGroup)?.label || ex.muscleGroup || '—'}
                    </Badge>
                  </TD>
                  <TD>
                    {ex.videoUrl ? (
                      <a
                        href={ex.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-triad-700 font-medium inline-flex items-center gap-1 hover:underline"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Ver
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TD>
                  <TD>
                    <Badge variant={ex.active !== false ? 'success' : 'neutral'} dot>
                      {ex.active !== false ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TD>
                  <TD align="right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => openEdit(ex)}
                        className="w-8 h-8 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center transition"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {ex.active !== false ? (
                        <button
                          onClick={() => setConfirmDelete(ex)}
                          className="w-8 h-8 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center transition"
                          title="Desativar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(ex)}
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar exercício' : 'Novo exercício'}
        subtitle="Dados do exercício."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Salvar</Button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <Input
            label="Nome do exercício"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Supino reto, Agachamento..."
            required
          />
          <Select
            label="Grupo muscular"
            value={form.muscleGroup}
            onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })}
            options={[
              { value: '', label: 'Selecione...' },
              ...MUSCLE_GROUPS,
            ]}
          />
          <Textarea
            label="Descrição (opcional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Instruções, dicas de execução..."
          />
          <Input
            label="URL do vídeo (opcional)"
            type="url"
            value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            placeholder="https://youtube.com/..."
          />
          {editing && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 accent-triad-600"
              />
              <span className="text-sm text-gray-600">Exercício ativo</span>
            </div>
          )}
        </form>
      </Modal>

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Desativar exercício"
        subtitle={confirmDelete?.name}
        message="O exercício ficará inativo e não aparecerá na biblioteca para novos treinos. Treinos existentes continuam válidos."
        confirmLabel="Desativar"
      />
    </>
  );
}

// ============================================
// 5. EVOLUÇÃO DOS ALUNOS
// ============================================
export function ProfEvolution() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [evolution, setEvolution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvo, setLoadingEvo] = useState(false);

  useEffect(() => { loadStudents(); }, []);
  useEffect(() => { if (selectedStudent) loadEvolution(); }, [selectedStudent]);

  async function loadStudents() {
    try {
      const { data } = await api.get('/students?active=true');
      const list = data || [];
      setStudents(list);
      if (list.length > 0) setSelectedStudent(list[0].id);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar'));
    } finally {
      setLoading(false);
    }
  }

  async function loadEvolution() {
    setLoadingEvo(true);
    try {
      const { data } = await api.get(`/students/${selectedStudent}/evolution`);
      setEvolution(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar evolução'));
    } finally {
      setLoadingEvo(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Evolução"
        subtitle="Acompanhe o progresso dos alunos por exercício."
      />

      <Card className="mb-5">
        <CardBody>
          <Select
            label="Aluno"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            options={[
              { value: '', label: 'Selecione um aluno...' },
              ...students.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        </CardBody>
      </Card>

      {loading || loadingEvo ? (
        <Card><CardBody><Skeleton variant="block" /></CardBody></Card>
      ) : evolution.length === 0 ? (
        <Card>
          <EmptyState
            icon={TrendingUp}
            title="Sem dados de evolução"
            description={selectedStudent ? 'Este aluno ainda não tem histórico de treinos.' : 'Selecione um aluno.'}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {evolution.map((ex) => (
            <Card key={ex.exerciseId}>
              <CardHeader
                title={ex.exerciseName}
                subtitle={ex.muscleGroup ? MUSCLE_GROUPS.find((g) => g.value === ex.muscleGroup)?.label : ''}
                action={<Badge variant="neutral">{ex.history.length} registros</Badge>}
              />
              <Table>
                <THead>
                  <TR hover={false}>
                    <TH>Treino</TH>
                    <TH>Data</TH>
                    <TH>Séries</TH>
                    <TH>Reps</TH>
                    <TH>Peso</TH>
                    <TH>Observações</TH>
                  </TR>
                </THead>
                <TBody>
                  {ex.history.map((h, i) => (
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
                      <TD className="text-xs text-gray-500">{h.notes || '—'}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}