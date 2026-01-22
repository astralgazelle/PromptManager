let targetElement = null;

document.addEventListener('contextmenu', (e) => {
    targetElement = e.target;
}, true);

document.addEventListener('focus', (e) => {
    targetElement = e.target;
}, true);

browser.runtime.onMessage.addListener((msg) => {
    let el = targetElement || document.activeElement;

    if (!el) return;

    if (!el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
        if (el.closest('[contenteditable="true"]')) {
            el = el.closest('[contenteditable="true"]');
        }
    }

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
