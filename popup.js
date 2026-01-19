const listEl = document.getElementById('prompt-list');
const searchEl = document.getElementById('search');
const manageBtn = document.getElementById('manage-btn');

let allPrompts = [];

browser.storage.local.get(['prompts']).then(res => {
    allPrompts = res.prompts || [];
    render(allPrompts);
});

function render(prompts) {
    listEl.innerHTML = '';
    if (prompts.length === 0) {
        const empty = document.createElement('li');
        empty.textContent = "No prompts found.";
        empty.style.cursor = "default";
        empty.style.fontStyle = "italic";
        listEl.appendChild(empty);
        return;
    }

    prompts.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        li.title = text;
        li.addEventListener('click', () => insertText(text));
        listEl.appendChild(li);
    });
}

searchEl.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allPrompts.filter(p => p.toLowerCase().includes(query));
    render(filtered);
});

manageBtn.addEventListener('click', () => {
    browser.runtime.openOptionsPage();
});

function insertText(text) {
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
        if (tabs[0]) {
            browser.tabs.sendMessage(tabs[0].id, { text: text });
            window.close();
        }
    });
}
