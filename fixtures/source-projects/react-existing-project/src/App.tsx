import { useState } from 'react';

type Task = { id: number; title: string; status: 'open' | 'done' };

const initialTasks: Task[] = [
  { id: 1, title: 'Rever prioridades', status: 'open' },
  { id: 2, title: 'Preparar resumo', status: 'done' },
  { id: 3, title: 'Organizar a semana', status: 'open' },
];

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);

  function addTask() {
    setTasks((current) => [...current, { id: Date.now(), title: 'Nova tarefa', status: 'open' }]);
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">PULSE BOARD</p>
          <h1>O teu trabalho, em foco.</h1>
          <p className="secondary">Resumo semanal de demonstração</p>
        </div>
        <div className="clickable-action" onClick={addTask}>
          + Nova tarefa
        </div>
      </header>

      <section className="stats" aria-label="Resumo semanal">
        <article className="panel"><p className="secondary">Concluídas esta semana</p><strong>18</strong></article>
        <article className="panel"><p className="secondary">Tarefas abertas</p><strong>{tasks.filter((task) => task.status === 'open').length}</strong></article>
        <article className="panel"><p className="secondary">Sessões de foco</p><strong>5</strong></article>
      </section>

      <section className="task-section" aria-labelledby="tasks-heading">
        <div className="section-heading">
          <h2 id="tasks-heading">As tuas tarefas</h2>
          <button type="button" onClick={addTask}>Adicionar</button>
        </div>
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-row">
              <span>{task.title}</span>
              <span className={task.status === 'done' ? 'status done' : 'status'}>
                {task.status === 'done' ? 'Concluída' : 'Em aberto'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
