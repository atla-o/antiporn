chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("antiporn-tick", { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener(() => {
  chrome.storage.local.get(["antiporn"], (res) => {
    const state = res.antiporn || { severity: 35 };
    chrome.storage.local.set({ antiporn: state });
  });
});
