function updateMenus() {
    browser.contextMenus.removeAll();

    browser.storage.local.get(['prompts']).then((res) => {
        const prompts = res.prompts || [];

        if (prompts.length > 0) {
            browser.contextMenus.create({
                id: "paste-root",
                title: "Insert prompt",
                contexts: ["editable"]
            });

            prompts.forEach((text, index) => {
                const title = text.length > 60 ? text.substring(0, 60) + "..." : text;
                browser.contextMenus.create({
                    id: `paste-${index}`,
                    parentId: "paste-root",
                    title: title,
                    contexts: ["editable"]
                });
            });
        }
    });
}

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId.startsWith("paste-")) {
        const index = parseInt(info.menuItemId.split("-")[1]);
        browser.storage.local.get(['prompts']).then((res) => {
            const prompts = res.prompts || [];
            if (prompts[index]) {
                browser.tabs.sendMessage(tab.id, { text: prompts[index] });
            }
        });
    }
});

browser.runtime.onInstalled.addListener(updateMenus);
browser.runtime.onStartup.addListener(updateMenus);
browser.storage.onChanged.addListener(updateMenus);
