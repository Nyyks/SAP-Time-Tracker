// Displays total time wasted in popup
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}


chrome.runtime.sendMessage({ type: 'getTotalTime' }, (response) => {
  document.getElementById('total').textContent = 'Total: ' + formatTime(response.totalTime);
});

chrome.runtime.sendMessage({ type: 'getTodayTime' }, (response) => {
  document.getElementById('today').textContent = 'Today: ' + formatTime(response.todayTime);
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
});
