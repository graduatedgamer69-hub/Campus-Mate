document.addEventListener('DOMContentLoaded', () => {
    // ---- State ----
    let subjects = JSON.parse(localStorage.getItem('campusmate_attendance')) || [];

    // ---- DOM Elements ----
    const subjectsList = document.getElementById('subjects-list');
    const overallPercentageEl = document.getElementById('overall-percentage');
    const overallChart = document.getElementById('overall-chart');
    
    // Modal
    const modal = document.getElementById('subject-modal');
    const addBtn = document.getElementById('add-subject-btn');
    const cancelBtn = document.getElementById('cancel-modal');
    const saveBtn = document.getElementById('save-subject');
    
    // Calculator
    const missClassesInput = document.getElementById('miss-classes');
    const projectedAttendanceEl = document.getElementById('projected-attendance');

    // ---- Initialization ----
    renderSubjects();
    updateOverallStats();

    // ---- Event Listeners ----
    addBtn.addEventListener('click', () => openModal());
    cancelBtn.addEventListener('click', closeModal);
    
    saveBtn.addEventListener('click', () => {
        const idInput = document.getElementById('subj-id').value;
        const name = document.getElementById('subj-name').value.trim();
        const attended = parseInt(document.getElementById('subj-attended').value) || 0;
        const total = parseInt(document.getElementById('subj-total').value) || 0;

        if (!name || total < attended) {
            alert('Please enter valid data. Total classes must be >= attended classes.');
            return;
        }

        if (idInput) {
            // Edit existing
            const index = subjects.findIndex(s => s.id == idInput);
            if (index !== -1) {
                subjects[index] = { ...subjects[index], name, attended, total };
            }
        } else {
            // Add new
            subjects.push({ id: Date.now(), name, attended, total });
        }

        saveData();
        renderSubjects();
        updateOverallStats();
        closeModal();
    });

    missClassesInput.addEventListener('input', updateOverallStats);

    // ---- Functions ----
    function openModal(subj = null) {
        modal.classList.remove('hidden');
        if (subj) {
            document.getElementById('subj-id').value = subj.id;
            document.getElementById('subj-name').value = subj.name;
            document.getElementById('subj-attended').value = subj.attended;
            document.getElementById('subj-total').value = subj.total;
        } else {
            document.getElementById('subj-id').value = '';
            document.getElementById('subj-name').value = '';
            document.getElementById('subj-attended').value = '';
            document.getElementById('subj-total').value = '';
        }
    }

    function closeModal() {
        modal.classList.add('hidden');
    }

    function saveData() {
        localStorage.setItem('campusmate_attendance', JSON.stringify(subjects));
    }

    function updateSubject(id, action) {
        const index = subjects.findIndex(s => s.id === id);
        if (index === -1) return;

        if (action === 'attend') {
            subjects[index].attended++;
            subjects[index].total++;
        } else if (action === 'bunk') {
            subjects[index].total++;
        } else if (action === 'delete') {
            if(confirm('Are you sure you want to remove this subject?')) {
                subjects.splice(index, 1);
            } else {
                return;
            }
        }

        saveData();
        renderSubjects();
        updateOverallStats();
    }

    function getPercentage(attended, total) {
        if (total === 0) return 0;
        return Math.round((attended / total) * 100);
    }

    function getColorClass(percentage) {
        if (percentage >= 75) return 'text-success';
        if (percentage >= 65) return 'text-warning';
        return 'text-danger';
    }
    
    function getCSSColor(percentage) {
        if (percentage >= 75) return 'var(--success)';
        if (percentage >= 65) return 'var(--warning)';
        return 'var(--danger)';
    }

    function updateOverallStats() {
        let totalAttended = 0;
        let totalClasses = 0;

        subjects.forEach(s => {
            totalAttended += s.attended;
            totalClasses += s.total;
        });

        const overallPercent = getPercentage(totalAttended, totalClasses);
        overallPercentageEl.innerText = `${overallPercent}%`;
        
        // Update Chart Circle
        // Circumference of r=50 circle is 2 * PI * 50 = ~314
        const circumference = 314;
        const offset = circumference - (overallPercent / 100) * circumference;
        overallChart.style.strokeDashoffset = offset;
        overallChart.className = `progress-ring__circle value ${getColorClass(overallPercent)}`;

        // Predictor
        const missVal = parseInt(missClassesInput.value) || 0;
        const projectedClasses = totalClasses + missVal;
        const projectedPercent = getPercentage(totalAttended, projectedClasses);
        
        projectedAttendanceEl.innerText = `${projectedPercent}%`;
        projectedAttendanceEl.className = getColorClass(projectedPercent);
    }

    function renderSubjects() {
        subjectsList.innerHTML = '';
        
        if(subjects.length === 0) {
            subjectsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No subjects added yet. Click "Add Subject" to begin.</p>';
            return;
        }

        subjects.forEach(subj => {
            const percent = getPercentage(subj.attended, subj.total);
            const colorClass = getColorClass(percent);
            const barColor = getCSSColor(percent);

            const card = document.createElement('div');
            card.className = 'subject-card glass';
            card.innerHTML = `
                <div class="subj-actions">
                    <i class="ph ph-pencil-simple edit-btn"></i>
                    <i class="ph ph-trash delete-btn"></i>
                </div>
                <h4>${subj.name}</h4>
                <div class="subj-stats">
                    <span>${subj.attended} / ${subj.total} Classes</span>
                    <strong class="${colorClass}">${percent}%</strong>
                </div>
                <div class="subj-bar-container">
                    <div class="subj-bar" style="width: ${percent}%; background-color: ${barColor}"></div>
                </div>
                <div class="quick-actions">
                    <button class="attend"><i class="ph ph-check"></i> Attended</button>
                    <button class="bunk"><i class="ph ph-x"></i> Bunked</button>
                </div>
            `;

            // Attach listeners to buttons
            card.querySelector('.attend').addEventListener('click', () => updateSubject(subj.id, 'attend'));
            card.querySelector('.bunk').addEventListener('click', () => updateSubject(subj.id, 'bunk'));
            card.querySelector('.delete-btn').addEventListener('click', () => updateSubject(subj.id, 'delete'));
            card.querySelector('.edit-btn').addEventListener('click', () => openModal(subj));

            subjectsList.appendChild(card);
        });
    }
});
