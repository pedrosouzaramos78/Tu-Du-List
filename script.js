// ==================== Flow To-Do List - Script Completo ====================

let tasks = [];
let currentFilter = 'all';
let selectedPriority = 'Média';

// Elementos DOM
let taskListEl, emptyStateEl, pendingNumberEl, taskCountEl, priorityPillsEl;

function loadTasks() {
    const saved = localStorage.getItem('flow_tasks');
    if (saved) {
        tasks = JSON.parse(saved);
    } else {
        tasks = [
            { id: Date.now() - 300000, text: "Finalizar apresentação do projeto Q2", priority: "Alta", completed: false },
            { id: Date.now() - 200000, text: "Responder e-mails da equipe", priority: "Média", completed: true },
            { id: Date.now() - 100000, text: "Revisar proposta comercial", priority: "Baixa", completed: false }
        ];
        saveTasks();
    }
}

function saveTasks() {
    localStorage.setItem('flow_tasks', JSON.stringify(tasks));
}

function createPriorityPills() {
    priorityPillsEl.innerHTML = `
        <div onclick="setPriority(this)" data-priority="Alta" class="priority-pill cursor-pointer px-5 py-3 rounded-3xl bg-red-500/10 text-red-400 text-sm font-medium flex items-center gap-2">
            <span class="w-3 h-3 bg-red-400 rounded-full"></span> Alta
        </div>
        <div onclick="setPriority(this)" data-priority="Média" class="priority-pill active cursor-pointer px-5 py-3 rounded-3xl bg-amber-500/10 text-amber-400 text-sm font-medium flex items-center gap-2">
            <span class="w-3 h-3 bg-amber-400 rounded-full"></span> Média
        </div>
        <div onclick="setPriority(this)" data-priority="Baixa" class="priority-pill cursor-pointer px-5 py-3 rounded-3xl bg-emerald-500/10 text-emerald-400 text-sm font-medium flex items-center gap-2">
            <span class="w-3 h-3 bg-emerald-400 rounded-full"></span> Baixa
        </div>
    `;
}

window.setPriority = function(el) {
    document.querySelectorAll('.priority-pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    selectedPriority = el.dataset.priority;
};

function addTask(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('task-input');
    const text = input.value.trim();
    
    if (!text) return;

    tasks.unshift({
        id: Date.now(),
        text: text,
        priority: selectedPriority,
        completed: false
    });

    saveTasks();
    renderTasks();
    input.value = '';
}

window.toggleComplete = function(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
};

window.deleteTask = function(id) {
    const el = document.querySelector(`[data-task-id="${id}"]`);
    if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateX(30px)';
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        }, 300);
    }
};

window.setFilter = function(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.dataset.active = (btn.id === `filter-${filter}`);
    });
    renderTasks();
};

window.clearAllCompleted = function() {
    if (confirm('Remover todas as tarefas concluídas?')) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
    }
};

window.resetApp = function() {
    if (confirm('Resetar toda a aplicação?')) {
        localStorage.clear();
        location.reload();
    }
};

function renderTasks() {
    let filtered = tasks;
    if (currentFilter === 'active') filtered = tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') filtered = tasks.filter(t => t.completed);

    // Atualiza contadores
    pendingNumberEl.textContent = tasks.filter(t => !t.completed).length;
    taskCountEl.textContent = `${tasks.length} tarefa${tasks.length !== 1 ? 's' : ''}`;

    // Empty state
    if (filtered.length === 0) {
        taskListEl.classList.add('hidden');
        emptyStateEl.classList.remove('hidden');
        return;
    } else {
        taskListEl.classList.remove('hidden');
        emptyStateEl.classList.add('hidden');
    }

    const priorityStyles = {
        'Alta':  { bg: 'bg-red-500/10 text-red-400 border-red-400/30',   dot: 'bg-red-400' },
        'Média': { bg: 'bg-amber-500/10 text-amber-400 border-amber-400/30', dot: 'bg-amber-400' },
        'Baixa': { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30', dot: 'bg-emerald-400' }
    };

    let html = '';

    filtered.forEach(task => {
        const style = priorityStyles[task.priority];
        html += `
        <li data-task-id="${task.id}" class="task-item glass border border-white/10 hover:border-white/30 rounded-3xl px-6 py-5 flex items-center gap-5 group">
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleComplete(${task.id})"
                   class="w-6 h-6 accent-violet-500 bg-white/10 border-2 border-white/30 rounded-xl cursor-pointer">

            <div class="flex-1 min-w-0">
                <p class="${task.completed ? 'line-through text-slate-400' : 'text-slate-100'} text-[17px] font-medium leading-tight">
                    ${task.text}
                </p>
            </div>

            <div class="priority-badge flex items-center gap-x-2 px-5 py-2 rounded-3xl text-xs font-semibold border ${style.bg}">
                <span class="w-2 h-2 ${style.dot} rounded-full"></span>
                ${task.priority}
            </div>

            <button onclick="deleteTask(${task.id})" 
                    class="text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-400/10 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6h12v12" />
                </svg>
            </button>
        </li>`;
    });

    taskListEl.innerHTML = html;
}

function init() {
    taskListEl = document.getElementById('task-list');
    emptyStateEl = document.getElementById('empty-state');
    pendingNumberEl = document.getElementById('pending-number');
    taskCountEl = document.getElementById('task-count');
    priorityPillsEl = document.getElementById('priority-pills');

    loadTasks();
    createPriorityPills();
    renderTasks();

    document.getElementById('add-form').addEventListener('submit', addTask);

    // Atalho Ctrl/Cmd + K
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('task-input').focus();
        }
    });

    console.log('%c✅ Flow To-Do List carregado com sucesso!', 'color:#a855f7; font-weight:600');
}

window.onload = init;