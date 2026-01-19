let lastActiveElement = null;

document.addEventListener('focus', (e) => {
    lastActiveElement = e.target;
}, true);

document.addEventListener('blur', (e) => {
    const t = e.target;
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) {
        lastActiveElement = t;
    }
}, true);

browser.runtime.onMessage.addListener((msg) => {
    const el = lastActiveElement || document.activeElement;

    if (!el) return;

    const text = msg.text;

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.focus();
        const start = el.selectionStart || 0;
        const end = el.selectionEnd || 0;
        const val = el.value;
        el.value = val.slice(0, start) + text + val.slice(end);
        el.selectionStart = el.selectionEnd = start + text.length;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    else if (el.isContentEditable) {
        el.focus();
        document.execCommand('insertText', false, text);
    }
});
