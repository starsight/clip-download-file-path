chrome.downloads.onChanged.addListener(function(downloadDelta) {
  if (downloadDelta.state && downloadDelta.state.current === "complete") {
    chrome.downloads.search({id: downloadDelta.id}, function(downloads) {
      if (downloads && downloads.length > 0) {
        const filePath = downloads[0].filename;
        console.log("下载 success: ", downloads[0]);
        // 复制路径到剪贴板
        copyToClipboard(filePath);
      }
    });
  }
});

function notifyUser(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',  // 确保这个文件存在
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

function copyToClipboard(text) {
  // 创建一个内容脚本来访问剪贴板
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: textToClipboard,
        args: [text]
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error('执行脚本失败:', chrome.runtime.lastError.message);
          notifyUser('复制文件路径失败: ' + chrome.runtime.lastError.message);
        } else {
          console.log('路径已复制到剪贴板,path:'+text);
          // notifyUser('文件路径已复制到剪贴板');
        }
      });
    } else {
      console.error('没有找到活动标签页');
      notifyUser('复制文件路径失败：没有活动标签页');
    }
  });
}

// 这个函数将在内容脚本中执行
function textToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}
