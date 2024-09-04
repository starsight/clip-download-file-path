document.getElementById('getLatestDownload').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "getLatestDownload"}, function(response) {
        const outputElement = document.getElementById('output');
        if (response.filePath) {
            outputElement.textContent = response.filePath;
            copyToClipboard(response.filePath); // 复制到剪贴板
        } else {
            outputElement.textContent = '没有找到最新下载文件';
        }
    });
});

// 复制到剪贴板的函数
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('路径已复制到剪贴板, path: ' + text);
    }).catch(err => {
        console.error('复制到剪贴板失败:', err);
    });
}