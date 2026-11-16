const STORAGE_KEY = 'minhaGrade_v1';

let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  tarefas: [],
  aulas: [],
  notas: []
};

function salvarDados() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  renderizarTudo();
}

// Navegação por Abas
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// 1. Provas e Tarefas
document.getElementById('form-tarefa').addEventListener('submit', e => {
  e.preventDefault();
  dados.tarefas.push({
    id: Date.now(),
    titulo: document.getElementById('tarefa-titulo').value,
    materia: document.getElementById('tarefa-materia').value,
    data: document.getElementById('tarefa-data').value,
    concluida: false
  });
  e.target.reset();
  salvarDados();
});

function alternarTarefa(id) {
  const item = dados.tarefas.find(t => t.id === id);
  if (item) item.concluida = !item.concluida;
  salvarDados();
}

function removerItem(tipo, id) {
  dados[tipo] = dados[tipo].filter(i => i.id !== id);
  salvarDados();
}

// 2. Grade Horária
document.getElementById('form-aula').addEventListener('submit', e => {
  e.preventDefault();
  dados.aulas.push({
    id: Date.now(),
    dia: document.getElementById('aula-dia').value,
    hora: document.getElementById('aula-hora').value,
    materia: document.getElementById('aula-materia').value,
    prof: document.getElementById('aula-prof').value
  });
  e.target.reset();
  salvarDados();
});

// 3. Calculadora de Notas
document.getElementById('form-nota').addEventListener('submit', e => {
  e.preventDefault();
  const n1 = parseFloat(document.getElementById('nota-1').value) || 0;
  const n2 = document.getElementById('nota-2').value !== '' ? parseFloat(document.getElementById('nota-2').value) : null;
  const n3 = document.getElementById('nota-3').value !== '' ? parseFloat(document.getElementById('nota-3').value) : null;

  dados.notas.push({
    id: Date.now(),
    materia: document.getElementById('nota-materia').value,
    n1, n2, n3
  });
  e.target.reset();
  salvarDados();
});

function calcularContagemDias(dataStr) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(dataStr + 'T00:00:00');
  const diff = Math.round((alvo - hoje) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Encerrado';
  if (diff === 0) return 'É hoje!';
  if (diff === 1) return 'Amanhã';
  return `Faltam ${diff} dias`;
}

function renderizarTudo() {
  // Render Tarefas
  const listaTarefas = document.getElementById('lista-tarefas');
  const ordenadas = [...dados.tarefas].sort((a, b) => a.data.localeCompare(b.data));
  listaTarefas.innerHTML = ordenadas.map(t => `
    <div class="item ${t.concluida ? 'concluido' : ''}">
      <div>
        <strong>${t.titulo}</strong>
        <small>${t.materia} • ${t.data.split('-').reverse().join('/')}</small>
        <span class="badge">${calcularContagemDias(t.data)}</span>
      </div>
      <div class="acoes">
        <button class="btn-icon btn-check" onclick="alternarTarefa(${t.id})">✓</button>
        <button class="btn-icon btn-del" onclick="removerItem('tarefas', ${t.id})">✕</button>
      </div>
    </div>
  `).join('');

  // Render Grade
  const listaGrade = document.getElementById('lista-grade');
  const diasOrdem = { 'Segunda': 1, 'Terça': 2, 'Quarta': 3, 'Quinta': 4, 'Sexta': 5 };
  const aulasOrd = [...dados.aulas].sort((a, b) => (diasOrdem[a.dia] - diasOrdem[b.dia]) || a.hora.localeCompare(b.hora));
  listaGrade.innerHTML = aulasOrd.map(a => `
    <div class="item">
      <div>
        <strong>${a.dia} - ${a.hora} | ${a.materia}</strong>
        <small>${a.prof ? 'Prof. ' + a.prof : 'Sem professor informado'}</small>
      </div>
      <button class="btn-icon btn-del" onclick="removerItem('aulas', ${a.id})">✕</button>
    </div>
  `).join('');

  // Render Notas
  const listaNotas = document.getElementById('lista-notas');
  listaNotas.innerHTML = dados.notas.map(n => {
    const notasValidas = [n.n1, n.n2, n.n3].filter(v => v !== null);
    const soma = notasValidas.reduce((acc, v) => acc + v, 0);
    const mediaAtual = (soma / notasValidas.length).toFixed(1);
    const faltaPara18 = Math.max(0, 18 - soma).toFixed(1);
    const status = notasValidas.length < 3
      ? `Faltam ${faltaPara18} pts para fechar média 6,0`
      : (mediaAtual >= 6 ? 'Aprovado na média!' : 'Em recuperação');

    return `
      <div class="item">
        <div>
          <strong>${n.materia} — Média: ${mediaAtual}</strong>
          <small>Notas: ${notasValidas.join(' | ')}</small>
          <span class="badge">${status}</span>
        </div>
        <button class="btn-icon btn-del" onclick="removerItem('notas', ${n.id})">✕</button>
      </div>
    `;
  }).join('');
}

// Exportar Backup JSON
document.getElementById('btn-exportar').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup-minhagrade.json';
  a.click();
});

// Registrar Service Worker (PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

renderizarTudo();