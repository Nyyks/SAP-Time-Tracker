// Handles storage and communication for time tracking

function getTodayKey() {
  const today = new Date();
  return `today_${today.getFullYear()}_${today.getMonth()+1}_${today.getDate()}`;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'addTime') {
    chrome.storage.local.get(['totalTime', getTodayKey()], (result) => {
      const newTotal = (result.totalTime || 0) + message.seconds;
      const newToday = (result[getTodayKey()] || 0) + message.seconds;
      let update = { totalTime: newTotal };
      update[getTodayKey()] = newToday;
      chrome.storage.local.set(update);
      sendResponse({ success: true });
    });
    return true;
  }
  if (message.type === 'getTotalTime') {
    chrome.storage.local.get(['totalTime'], (result) => {
      sendResponse({ totalTime: result.totalTime || 0 });
    });
    return true;
  }
  if (message.type === 'getTodayTime') {
    chrome.storage.local.get([getTodayKey()], (result) => {
      sendResponse({ todayTime: result[getTodayKey()] || 0 });
    });
    return true;
  }
});
