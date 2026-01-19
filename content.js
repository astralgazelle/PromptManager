browser.runtime.onMessage.addListener((msg) => {
    const el = document.activeElement;
    if (!el) return;

    const text = msg.text;

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        const start = el.selectionStart;
        const val = el.value;
        el.value = val.slice(0, start) + text + val.slice(el.selectionEnd);
        el.selectionStart = el.selectionEnd = start + text.length;

        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    else if (el.isContentEditable) {
        document.execCommand('insertText', false, text);
    }
});
