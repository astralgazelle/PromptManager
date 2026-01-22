function truncate(str, n) {
    return (str.length > n) ? str.slice(0, n - 1) + '...' : str;
}

function updateContextMenus() {
    browser.contextMenus.removeAll().then(() => {
        browser.storage.local.get(['prompts']).then(res => {
            const prompts = res.prompts || [];

            if (prompts.length === 0) return;

            browser.contextMenus.create({
                id: "parent-prompt-manager",
                title: "Insert prompt",
                contexts: ["editable"]
            });

            prompts.forEach((text, index) => {
                const menuId = `prompt-${index}`;
                const cleanTitle = text.replace(/\s+/g, ' ').trim();

                browser.contextMenus.create({
                    id: menuId,
                    parentId: "parent-prompt-manager",
                    title: truncate(cleanTitle, 30),
                                            contexts: ["editable"]
                });
            });
        });
    });
}

browser.runtime.onInstalled.addListener(() => {
    updateContextMenus();
});

browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.prompts) {
        updateContextMenus();
    }
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId.startsWith("prompt-")) {
        const index = parseInt(info.menuItemId.split('-')[1], 10);

        browser.storage.local.get(['prompts']).then(res => {
            const prompts = res.prompts || [];
            if (prompts[index]) {
                browser.tabs.sendMessage(tab.id, { text: prompts[index] });
            }
        });
    }
});
