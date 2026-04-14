document.addEventListener('DOMContentLoaded', () => {
    // ---- State ----
    let tasks = JSON.parse(localStorage.getItem('campusmate_tasks')) || [];
    let timerInterval;
    let timeRemaining = 180 * 60;
    let isRunning = false;
    let pomodoroCount = 0;

    // ---- DOM Elements ----
    // Tasks
    const taskNameInput = document.getElementById('task-name');
    const taskDeadlineInput = document.getElementById('task-deadline');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    // Timer
    const timerText = document.getElementById('timer-text');
    const timerStartBtn = document.getElementById('timer-start');
    const timerResetBtn = document.getElementById('timer-reset');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const burnoutAlert = document.getElementById('burnout-alert');

    // ---- Initialization ----
    renderTasks();
    updateTimerDisplay();

    // ---- Task Logic ----
    addTaskBtn.addEventListener('click', () => {
        const title = taskNameInput.value.trim();
        const deadline = taskDeadlineInput.value;

        if (!title) return;

        tasks.push({
            id: Date.now(),
            title,
            deadline,
            completed: false
        });

        taskNameInput.value = '';
        taskDeadlineInput.value = '';
        saveTasks();
        renderTasks();
    });

    function saveTasks() {
        localStorage.setItem('campusmate_tasks', JSON.stringify(tasks));
    }

    window.toggleTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) task.completed = !task.completed;
        saveTasks();
        renderTasks();
    };

    window.deleteTask = (id) => {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    };

    function renderTasks() {
        taskList.innerHTML = '';
        
        // Sort by deadline, then uncompleted first
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline) - new Date(b.deadline);
        });

        if (sortedTasks.length === 0) {
            taskList.innerHTML = '<li style="text-align:center; color:var(--text-muted); padding:20px;">No tasks. Enjoy your free time!</li>';
            return;
        }

        sortedTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            const dateStr = task.deadline ? `<div class="task-date"><i class="ph ph-calendar"></i> ${task.deadline}</div>` : '';
            
            li.innerHTML = `
                <div class="task-checkbox" onclick="toggleTask(${task.id})">
                    ${task.completed ? '<i class="ph ph-check"></i>' : ''}
                </div>
                <div class="task-content">
                    <span class="task-text">${task.title}</span>
                    ${dateStr}
                </div>
                <button class="del-task" onclick="deleteTask(${task.id})"><i class="ph ph-trash"></i></button>
            `;
            taskList.appendChild(li);
        });
    }

    // ---- Timer Logic ----
    modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            clearInterval(timerInterval);
            isRunning = false;
            timerStartBtn.innerText = 'Start';
            
            const minutes = parseInt(btn.getAttribute('data-time'));
            timeRemaining = minutes * 60;
            updateTimerDisplay();

            if (minutes > 5) {
                // If switching to long break, reset pomodoro count and alert
                pomodoroCount = 0;
                burnoutAlert.classList.add('hidden');
            }
        });
    });

    timerStartBtn.addEventListener('click', () => {
        if (isRunning) {
            clearInterval(timerInterval);
            timerStartBtn.innerText = 'Start';
            isRunning = false;
        } else {
            timerInterval = setInterval(tick, 1000);
            timerStartBtn.innerText = 'Pause';
            isRunning = true;
        }
    });

    timerResetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
        timerStartBtn.innerText = 'Start';
        const activeBtn = document.querySelector('.mode-btn.active');
        timeRemaining = parseInt(activeBtn.getAttribute('data-time')) * 60;
        updateTimerDisplay();
    });

    function tick() {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            isRunning = false;
            timerStartBtn.innerText = 'Start';
            alert('Timer Finished!');
            
            // Check burnout
            const activeMinutes = parseInt(document.querySelector('.mode-btn.active').getAttribute('data-time'));
            if (activeMinutes === 180) {
                pomodoroCount++;
                if (pomodoroCount >= 1) { // Alert after 1 3-hr session because 3 hrs is huge!
                    burnoutAlert.classList.remove('hidden');
                }
            }
        }
    }

    function updateTimerDisplay() {
        const mins = Math.floor(timeRemaining / 60);
        const secs = timeRemaining % 60;
        timerText.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
});
