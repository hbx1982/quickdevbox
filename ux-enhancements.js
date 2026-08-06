/**
 * QuickDevBox UX Enhancements (Data-Attribute Driven)
 * Automatically loaded on all tool pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Locate elements marked with specific data-attributes
    const inputAreas = document.querySelectorAll('textarea[data-ux="input"]');
    const primaryBtns = document.querySelectorAll('button[data-ux="action-primary"]');
    const clearBtns = document.querySelectorAll('button[data-ux="action-clear"]');
    const pageId = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

    // 1. Hook Input Areas (Persistence, Drag & Drop, Auto-Trigger)
    inputAreas.forEach((ta, index) => {
        const storageKey = `qdb_${pageId}_input_${index}`;

        // Restore from LocalStorage
        const saved = localStorage.getItem(storageKey);
        if (saved !== null && saved !== "") {
            ta.value = saved;
            // Trigger native UI updates if defined globally
            if (typeof updateCounter === 'function') setTimeout(updateCounter, 50);
        }

        // Save on input
        ta.addEventListener('input', () => {
            localStorage.setItem(storageKey, ta.value);
        });

        // Auto-Trigger on Paste
        ta.addEventListener('paste', () => {
            setTimeout(() => {
                localStorage.setItem(storageKey, ta.value);
                triggerPrimary();
            }, 50); // wait for paste to render
        });

        // Drag & Drop
        ta.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            ta.style.border = '2px dashed var(--primary-color)';
            ta.style.background = 'rgba(100, 255, 218, 0.05)';
        });

        ta.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            ta.style.border = '';
            ta.style.background = '';
        });

        ta.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            ta.style.border = '';
            ta.style.background = '';

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (file.size > 2 * 1024 * 1024) {
                    if (typeof showStatus === 'function') {
                        showStatus("File exceeds 2MB limit. Drag & Drop aborted.", true);
                    }
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    ta.value = event.target.result;
                    localStorage.setItem(storageKey, ta.value);
                    if (typeof updateCounter === 'function') updateCounter();
                    
                    // Auto-Trigger after file read
                    triggerPrimary();
                };
                reader.readAsText(file);
            }
        });
    });

    // 2. Hook Clear Buttons to wipe LocalStorage
    clearBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            inputAreas.forEach((ta, index) => {
                localStorage.removeItem(`qdb_${pageId}_input_${index}`);
            });
        });
    });

    // Helper: Trigger Primary Action Button
    function triggerPrimary() {
        if (primaryBtns.length > 0) {
            primaryBtns[0].click();
        }
    }
});
