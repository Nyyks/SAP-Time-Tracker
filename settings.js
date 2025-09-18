// Handles settings for custom URLs, selectors, and music
const urlsEl = document.getElementById('urls');
const selectorsEl = document.getElementById('selectors');
const statusEl = document.getElementById('status');
const musicToggle = document.getElementById('musicToggle');
const musicFile = document.getElementById('musicFile');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
let musicDataUrl = null;

chrome.storage.local.get(['customUrls', 'customSelectors', 'playMusic', 'musicDataUrl'], (result) => {
  urlsEl.value = (result.customUrls || []).join('\n');
  selectorsEl.value = (result.customSelectors || []).join('\n');
  musicToggle.checked = !!result.playMusic;
  musicDataUrl = result.musicDataUrl || null;
});

musicFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      musicDataUrl = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('settingsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const urls = urlsEl.value.split('\n').map(u => u.trim()).filter(u => u);
  const selectors = selectorsEl.value.split('\n').map(s => s.trim()).filter(s => s);
  const playMusic = musicToggle.checked;
  const data = { customUrls: urls, customSelectors: selectors, playMusic };
  if (musicDataUrl) {
    data.musicDataUrl = musicDataUrl;
  }
  chrome.storage.local.set(data, () => {
    statusEl.textContent = 'Settings saved!';
    setTimeout(() => statusEl.textContent = '', 2000);
  });
});

exportBtn.addEventListener('click', () => {
  chrome.storage.local.get(null, (data) => {
    // Only export time-related keys
    const exportData = {};
    for (const key in data) {
      if (key === 'totalTime' || key.startsWith('today_')) {
        exportData[key] = data[key];
      }
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sap_time_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});

importBtn.addEventListener('click', () => {
  importFile.click();
});

importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const importData = JSON.parse(evt.target.result);
        chrome.storage.local.set(importData, () => {
          statusEl.textContent = 'Time data imported!';
          setTimeout(() => statusEl.textContent = '', 2000);
        });
      } catch {
        statusEl.textContent = 'Invalid file!';
        setTimeout(() => statusEl.textContent = '', 2000);
      }
    };
    reader.readAsText(file);
  }
});
