/**
 * QuickDevBox UX Enhancements (Data-Attribute Driven)
 * Automatically loaded on all tool pages.
 * Supports: LocalStorage Persistence, Drag & Drop, Auto-Trigger, Incognito Safeguards, Sensitive Data Non-Persistence.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Safe LocalStorage Wrapper (Prevents Incognito Mode & Restricted Permission Exception Throws)
    const SafeStorage = {
        getItem: (key) => {
            try { return localStorage.getItem(key); } catch (e) { return null; }
        },
        setItem: (key, val) => {
            try { localStorage.setItem(key, val); } catch (e) {}
        },
        removeItem: (key) => {
            try { localStorage.removeItem(key); } catch (e) {}
        }
    };

    // Locate elements marked with specific data-attributes
    const inputAreas = document.querySelectorAll('textarea[data-ux="input"], textarea[data-ux="input-nopersist"]');
    const primaryBtns = document.querySelectorAll('button[data-ux="action-primary"]');
    const clearBtns = document.querySelectorAll('button[data-ux="action-clear"]');
    const pageId = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

    const sensitiveTools = ['aes-encryption-decryption', 'des-encryption-decryption', 'rsa-key-generator', 'ssh-key-pair-generator', 'bcrypt-hash-generator', 'pbkdf2-hash-generator', 'hmac-generator'];

    // 1. Hook Input Areas (Persistence, Drag & Drop, Auto-Trigger)
    inputAreas.forEach((ta, index) => {
        let isNoPersist = ta.getAttribute('data-ux') === 'input-nopersist' || ta.hasAttribute('data-no-persist');
        if (sensitiveTools.includes(pageId)) {
            isNoPersist = true; // Force disable persistence for sensitive crypto pages
        }
        const storageKey = `qdb_${pageId}_input_${index}`;

        // Restore from LocalStorage if allowed
        if (!isNoPersist) {
            const saved = SafeStorage.getItem(storageKey);
            if (saved !== null && saved !== "") {
                ta.value = saved;
                if (typeof updateCounter === 'function') setTimeout(updateCounter, 50);
            }
        }

        // Save on input (if allowed)
        ta.addEventListener('input', () => {
            if (!isNoPersist) {
                SafeStorage.setItem(storageKey, ta.value);
            }
        });

        // Auto-Trigger on Paste
        ta.addEventListener('paste', () => {
            setTimeout(() => {
                if (!isNoPersist) {
                    SafeStorage.setItem(storageKey, ta.value);
                }
                triggerPrimary();
            }, 50);
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
                    if (!isNoPersist) {
                        SafeStorage.setItem(storageKey, ta.value);
                    }
                    if (typeof updateCounter === 'function') updateCounter();
                    
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
                SafeStorage.removeItem(`qdb_${pageId}_input_${index}`);
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
