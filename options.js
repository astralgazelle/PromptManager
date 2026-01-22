let prompts = [];
let selectedIndex = -1;

const listEl = document.getElementById('prompt-list');
const editorEl = document.getElementById('editor');
const saveBtn = document.getElementById('save-btn');
const newBtn = document.getElementById('new-btn');
const delBtn = document.getElementById('del-btn');

function load() {
    browser.storage.local.get(['prompts']).then(res => {
        prompts = res.prompts || [];
        render();
    });
}

function render() {
    listEl.innerHTML = '';
    prompts.forEach((text, i) => {
        const li = document.createElement('li');
        li.textContent = text;
        if (i === selectedIndex) li.className = 'active';

        li.addEventListener('click', () => select(i));
        listEl.appendChild(li);
    });

    delBtn.disabled = selectedIndex === -1;
}

function select(index) {
    selectedIndex = index;
    editorEl.value = index === -1 ? '' : prompts[index];
    render();
}

newBtn.addEventListener('click', () => {
    selectedIndex = -1;
    editorEl.value = '';
    editorEl.focus();
    render();
});

saveBtn.addEventListener('click', () => {
    const text = editorEl.value.trim();
    if (!text) return;

    if (selectedIndex > -1) {
        prompts[selectedIndex] = text;
    } else {
        prompts.push(text);
        selectedIndex = prompts.length - 1;
    }

    browser.storage.local.set({ prompts }).then(load);
});

delBtn.addEventListener('click', () => {
    if (confirm("Delete this prompt?")) {
        if (selectedIndex > -1) {
            prompts.splice(selectedIndex, 1);
            selectedIndex = -1;
            editorEl.value = '';
            browser.storage.local.set({ prompts }).then(load);
        }
    }
});

document.addEventListener('DOMContentLoaded', load);

const importBtn = document.getElementById('import-btn');
const exportBtn = document.getElementById('export-btn');
const fileInput = document.getElementById('file-input');

exportBtn.addEventListener('click', () => {
    const data = JSON.stringify(prompts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompts.json';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedPrompts = JSON.parse(event.target.result);

            if (!Array.isArray(importedPrompts)) {
                alert("Invalid file format: Expected a JSON array.");
                return;
            }

            let addedCount = 0;
            importedPrompts.forEach(p => {
                if (typeof p === 'string' && !prompts.includes(p)) {
                    prompts.push(p);
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                browser.storage.local.set({ prompts }).then(() => {
                    load();
                    alert(`Imported ${addedCount} new prompts.`);
                });
            } else {
                alert("No new prompts found (duplicates skipped).");
            }
        } catch (err) {
            console.error(err);
            alert("Error parsing JSON file.");
        }

        fileInput.value = '';
    };
    reader.readAsText(file);
});
