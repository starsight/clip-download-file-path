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
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: textToClipboard,
        args: [text]
      }, (results) => {
        if (chrome.runtime.lastError) {
          handleClipboardError('执行脚本失败: ' + chrome.runtime.lastError.message);
        } else {
          console.log('路径已复制到剪贴板, path: ' + text);
          // notifyUser('文件路径已复制到剪贴板');
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

// 这个函数将在内容脚本中执行
function textToClipboard(text) {
  // 确保文档获得焦点
  document.activeElement.blur(); // 先失去焦点
  document.body.focus(); // 然后聚焦到 body

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(text).then(() => {
      console.log('路径已复制到剪贴板, path: ' + text);
    }).catch(err => {
      console.error('使用 navigator.clipboard 复制失败:', err);
      // 回退到 document.execCommand('copy')
      fallbackCopyToClipboard(text);
    });
  } else {
    fallbackCopyToClipboard(text);
  }


  function fallbackCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    console.log('使用 document.execCommand 复制成功, path: ' + text);
  }
}

// 添加消息监听器
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getLatestDownload") {
        chrome.downloads.search({state: 'complete'}, function(downloads) {
            // 过滤出 exists 为 true 的下载项
            const validDownloads = downloads.filter(download => download.exists);
            if (validDownloads.length > 0) {
                // 按照 endTime 转换为时间戳降序排序，获取最新的下载
                const latestDownload = validDownloads.sort((a, b) => {
                    return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
                })[0];
                sendResponse({filePath: latestDownload.filename});
            } else {
                sendResponse({filePath: null});
            }
        });
        return true; // 表示异步响应
    }
});