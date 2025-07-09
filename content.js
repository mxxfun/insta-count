chrome.storage.sync.get({ 'extensionEnabled': true }, function (data) {
    if (data.extensionEnabled) {
        init();
    }
});

function init() {
    'use strict';
    
    // Wartezeit für DOM-Updates
    const DEBOUNCE_DELAY = 500;
    let timeoutId;
    
    // Funktion zum Extrahieren der exakten Followerzahl aus dem title-Attribut
    function extractExactCount(element) {
        const title = element.getAttribute('title');
        if (!title) return null;
        
        // Extrahiere Zahlen aus dem title (z.B. "89,500 followers" -> "89,500")
        const match = title.match(/([\d,\.]+)/);
        if (match) {
            return match[1];
        }
        return null;
    }
    
    // Funktion zum Ersetzen der gerundeten Zahlen
    function replaceFollowerCounts() {
        // Verschiedene Selektoren für Follower-Zahlen auf Instagram
        const selectors = [
            'a[href*="/followers/"] span',
            'a[href*="/following/"] span',
            '[title*="follower"] span',
            '[title*="following"] span',
            'span[title*="follower"]',
            'span[title*="following"]'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            
            elements.forEach(element => {
                // Suche nach dem übergeordneten Element mit title-Attribut
                let titleElement = element;
                while (titleElement && !titleElement.getAttribute('title')) {
                    titleElement = titleElement.parentElement;
                    // Verhindere unendliche Schleifen
                    if (titleElement === document.body) break;
                }
                
                if (titleElement) {
                    const exactCount = extractExactCount(titleElement);
                    if (exactCount && element.textContent !== exactCount) {
                        // Überprüfe ob der aktuelle Text eine gerundete Zahl ist (enthält K, M etc.)
                        if (element.textContent.match(/[\d,\.]+[KM]/i) || 
                            element.textContent.match(/^[\d,\.]+$/)) {
                            element.textContent = exactCount;
                            element.style.color = '#0095f6'; // Instagram Blue
                            element.style.fontWeight = 'bold';
                        }
                    }
                }
            });
        });
        
        // Spezielle Behandlung für Profile Header
        const profileStats = document.querySelectorAll('section main header section ul li');
        profileStats.forEach(li => {
            const link = li.querySelector('a');
            const span = li.querySelector('span[title]');
            
            if (link && span) {
                const exactCount = extractExactCount(span);
                if (exactCount) {
                    const textNode = li.querySelector('span:not([title])') || span;
                    if (textNode && textNode.textContent !== exactCount) {
                        textNode.textContent = exactCount;
                        textNode.style.color = '#0095f6';
                        textNode.style.fontWeight = 'bold';
                    }
                }
            }
        });
    }
    
    // Debounced version der Replace-Funktion
    function debouncedReplace() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(replaceFollowerCounts, DEBOUNCE_DELAY);
    }
    
    // Observer für DOM-Änderungen
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'subtree') {
                shouldUpdate = true;
            }
        });
        
        if (shouldUpdate) {
            debouncedReplace();
        }
    });
    
    // Starte den Observer
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['title']
    });
    
    // Initiale Ausführung
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', replaceFollowerCounts);
    } else {
        replaceFollowerCounts();
    }
    
    // Zusätzliche Überprüfung nach Navigation (Instagram ist eine SPA)
    let currentUrl = location.href;
    setInterval(() => {
        if (location.href !== currentUrl) {
            currentUrl = location.href;
            setTimeout(replaceFollowerCounts, 1000);
        }
    }, 1000);
    
    console.log('Instagram Follower Counter Extension aktiviert');
}