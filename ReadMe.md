长久以来，我都遇到一个问题，浏览器里每次下完文件，如果需要在命令行使用，都需要 show in file explorer，然后再把路径拖入terminal……

这款chrome plugin 可以直接将下载完成后的路径复制到剪贴板中，以方便后续使用。

后续，如果有必要，可以考虑根据网址来源和文件类型，不每次都复制剪贴板，减少打扰。

目前的核心功能：
- 自动复制下载完成的文件路径到剪贴板
- 针对Windows平台，可选拷贝""；Mac&Linux空格自动转义，免去复制完路径

# update

## 2024-09-08
使用Plasmo+cursor重构一版。
