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
