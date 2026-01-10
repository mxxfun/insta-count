document.addEventListener('DOMContentLoaded', function () {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const statusText = document.getElementById('statusText');

    // Load initial state from chrome.storage
    chrome.storage.sync.get({ 'extensionEnabled': true }, function (data) {
        toggleSwitch.checked = data.extensionEnabled;
        updateStatusText(data.extensionEnabled);
    });

    // Event listener for toggle switch
    toggleSwitch.addEventListener('change', function () {
        const isEnabled = this.checked;
        chrome.storage.sync.set({ 'extensionEnabled': isEnabled }, function () {
            updateStatusText(isEnabled);
            // Notify active tab or reload to apply changes
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs[0] && tabs[0].url.includes('instagram.com')) {
                    chrome.tabs.reload(tabs[0].id);
                }
            });
        });
    });

    function updateStatusText(isEnabled) {
        if (isEnabled) {
            statusText.textContent = 'Extension is active';
            statusText.classList.add('active');
        } else {
            statusText.textContent = 'Extension is disabled';
            statusText.classList.remove('active');
        }
    }
});
