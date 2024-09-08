import { textToClipboard } from "./utils/clipboard";

export { }

console.log("Background script 已加载")

let copyDisabled = false
let escapeEnabled = false

function detectOS() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf("win") > -1) return "Windows";
  if (userAgent.indexOf("mac") > -1) return "MacOS";
  if (userAgent.indexOf("linux") > -1) return "Linux";
  return "Unknown";
}

const currentOS = detectOS();

// 初始化时从存储中读取设置
chrome.storage.local.get(["copyDisabled", "escapeEnabled"], (result) => {
  copyDisabled = result.copyDisabled ?? false
  escapeEnabled = result.escapeEnabled ?? true
  console.log("Background: 初始化设置", { copyDisabled, escapeEnabled, os: currentOS })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background: 收到消息", message, "来自", sender)
  if (message && message.action === "toggleCopy") {
    copyDisabled = message.disabled
    console.log("Background: 复制功能已", copyDisabled ? "禁用" : "启用")
    sendResponse({ status: "success", received: true })
  } else if (message && message.action === "toggleEscape") {
    escapeEnabled = message.enabled
    console.log("Background: 转义功能已", escapeEnabled ? "启用" : "禁用")
    sendResponse({ status: "success", received: true })
  }
  return true  // 表示我们将异步发送响应
})

// 监听下载完成事件
chrome.downloads.onChanged.addListener((delta) => {
  if (!copyDisabled && delta.state && delta.state.current === "complete") {
    chrome.downloads.search({ id: delta.id }, (results) => {
      if (results && results.length > 0) {
        let filePath = results[0].filename;
        if (escapeEnabled) {
          filePath = escapeSpecialChars(filePath);
        }
        console.log("下载 success: ", results[0]);
        copyToClipboard(filePath);
      }
    });
  }
});

function escapeSpecialChars(str: string): string {
  if (currentOS === "Windows") {
    // Windows系统: 在整个路径外层加上双引号
    return `"${str}"`;
  } else {
    // 其他系统(Unix, Mac): 只转义空格
    return str.replace(/ /g, '\\ ');
  }
}

function copyToClipboard(text: string) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: textToClipboard,
        args: [text]
      }, (results) => {
        if (chrome.runtime.lastError) {
          handleClipboardError('执行脚本失败: ' + chrome.runtime.lastError.message);
        } else if (results && results[0] && results[0].result === true) {
          console.log('路径已复制到剪贴板, path: ' + text);
          // notifyUser('文件路径已复制到剪贴板');
        } else {
          handleClipboardError('复制失败');
        }
      });
    } else {
      handleClipboardError('没有找到活动标签页');
    }
  });
}

function handleClipboardError(errorMessage) {
  console.error(errorMessage);
  notifyUser('复制文件路径失败: ' + errorMessage);
}


function notifyUser(message: string) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('assets/small_icon.png'),  // 使用chrome.runtime.getURL获取正确的URL
    title: '下载完成',
    message: message
  }, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error('通知创建失败:', chrome.runtime.lastError);
    } else {
      console.log('通知已创建，ID:', notificationId);
    }
  });
}
