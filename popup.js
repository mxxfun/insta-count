document.addEventListener('DOMContentLoaded', function () {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const statusText = document.getElementById('statusText');

    // Initialen Status aus chrome.storage laden und Schalter setzen
    chrome.storage.sync.get({ 'extensionEnabled': true }, function (data) {
        toggleSwitch.checked = data.extensionEnabled;
        updateStatusText(data.extensionEnabled);
    });

    // Event Listener für den Schalter
    toggleSwitch.addEventListener('change', function () {
        const isEnabled = this.checked;
        chrome.storage.sync.set({ 'extensionEnabled': isEnabled }, function () {
            updateStatusText(isEnabled);
            // Aktiven Tab benachrichtigen oder neu laden, um die Änderungen zu übernehmen
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs[0] && tabs[0].url.includes('instagram.com')) {
                    chrome.tabs.reload(tabs[0].id);
                }
            });
        });
    });

    function updateStatusText(isEnabled) {
        if (isEnabled) {
            statusText.textContent = 'Erweiterung ist aktiviert';
        } else {
            statusText.textContent = 'Erweiterung ist deaktiviert';
        }
    }
}); 