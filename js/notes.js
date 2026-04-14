document.addEventListener('DOMContentLoaded', () => {
    // ---- Mock Data ----
    let notes = [
        { id: 1, title: 'MDM Assignment 1', tags: 'cs, sem3', date: '2 days ago', uploader: 'Prof', upvotes: 4 },
        { id: 2, title: 'OS Practical List', tags: 'it, cs, sem5', date: '1 week ago', uploader: 'Prof', upvotes: 3 },
        { id: 3, title: 'CT Tutorial Sheet', tags: 'etc, sem2', date: '3 days ago', uploader: 'Prof', upvotes: 1 }
    ];

    // Check localStorage for newly added dummy notes
    const storedNotes = JSON.parse(localStorage.getItem('campusmate_notes'));
    if (storedNotes) {
        notes = [...notes, ...storedNotes];
    }

    // ---- DOM Elements ----
    const notesGrid = document.getElementById('notes-list');
    const searchInput = document.getElementById('note-search');
    const filterSelect = document.getElementById('note-filter');
    
    // Modal
    const modal = document.getElementById('upload-modal');
    const openModalBtn = document.getElementById('upload-note-btn');
    const cancelModalBtn = document.getElementById('cancel-upload');
    const saveUploadBtn = document.getElementById('save-upload');

    // ---- Initialization ----
    renderNotes(notes);

    // ---- Filtering & Search ----
    function applyFilters() {
        const term = searchInput.value.toLowerCase();
        const branch = filterSelect.value.toLowerCase();

        let filtered = notes.filter(n => {
            const matchesSearch = n.title.toLowerCase().includes(term) || n.tags.toLowerCase().includes(term);
            const matchesBranch = branch === 'all' || n.tags.toLowerCase().includes(branch);
            return matchesSearch && matchesBranch;
        });

        renderNotes(filtered);
    }

    searchInput.addEventListener('input', applyFilters);
    filterSelect.addEventListener('change', applyFilters);

    // ---- Render Method ----
    function renderNotes(items) {
        notesGrid.innerHTML = '';

        if (items.length === 0) {
            notesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No notes found matching your criteria.</p>';
            return;
        }

        // Sort by upvotes
        items.sort((a,b) => b.upvotes - a.upvotes);

        items.forEach(note => {
            const card = document.createElement('div');
            card.className = 'note-card glass';
            card.innerHTML = `
                <div class="note-card-icon"><i class="ph ph-file-pdf"></i></div>
                <div class="note-title">${note.title}</div>
                <div class="badge" style="width: max-content; margin-bottom: 8px;">${note.tags}</div>
                <div class="note-meta">
                    <span>Uploaded by ${note.uploader}</span>
                    <span>${note.date}</span>
                </div>
                <div class="note-actions">
                    <div class="vote-box">
                        <i class="ph ph-caret-up upvote-btn" onclick="this.style.color='var(--success)';"></i>
                        <strong>${note.upvotes}</strong>
                        <i class="ph ph-caret-down"></i>
                    </div>
                    ${note.fileData ? 
                        `<button class="btn-sm" onclick="downloadAssignment('${note.fileData}', '${note.fileName}')"><i class="ph ph-download-simple"></i> Download</button>`
                        : `<button class="btn-sm"><i class="ph ph-eye"></i> View</button>`
                    }
                </div>
            `;
            notesGrid.appendChild(card);
        });
    }

    // Expose download function to window
    window.downloadAssignment = function(dataUrl, fileName) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName || 'Assignment';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ---- Modal Logic for Uploading ----
    openModalBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    cancelModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

    saveUploadBtn.addEventListener('click', () => {
        const title = document.getElementById('up-title').value.trim();
        const tags = document.getElementById('up-tags').value.trim();
        const fileInput = document.getElementById('up-file');
        
        if (!title) {
            alert("Please enter a title.");
            return;
        }

        if (!fileInput.files.length) {
            alert("Please select a file to upload.");
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            const dataUrl = e.target.result;
            
            // Check size string approx (max 2MB to not crash localStorage)
            if (dataUrl.length > 2800000) {
                alert("File is too large for local caching. Please upload a file smaller than 2MB.");
                return;
            }

            const newNote = {
                id: Date.now(),
                title: title,
                tags: tags || 'general',
                date: 'Just now',
                uploader: 'You',
                upvotes: 0,
                fileData: dataUrl,
                fileName: file.name
            };

            // Save mock data locally
            let currentCustom = JSON.parse(localStorage.getItem('campusmate_notes')) || [];
            currentCustom.push(newNote);
            
            try {
                localStorage.setItem('campusmate_notes', JSON.stringify(currentCustom));
                notes.push(newNote);
                applyFilters(); 
                
                // Clean and close
                document.getElementById('up-title').value = '';
                document.getElementById('up-tags').value = '';
                document.getElementById('up-file').value = '';
                modal.classList.add('hidden');
            } catch(err) {
                alert("Storage limit exceeded. Cannot save more large files.");
            }
        };

        reader.readAsDataURL(file);
    });
});
