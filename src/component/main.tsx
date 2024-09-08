import { useState, useEffect } from "react"
import { Button, message } from "antd"
import { CopyOutlined } from "@ant-design/icons"
import { EscapeToggle, ToggleSwitch } from "./ToggleSwitch"
import { currentOS } from "~src/utils/osDetector"
import { textToClipboard } from "~src/utils/clipboard"

export function Main() {
    const [latestPath, setLatestPath] = useState<string>("")
    const [escapeEnabled, setEscapeEnabled] = useState(false)

    useEffect(() => {
        chrome.downloads.search({ state: 'complete' }, function (downloads) {
            const validDownloads = downloads.filter(download => download.exists);
            if (validDownloads.length > 0) {
                const latestDownload = validDownloads.sort((a, b) => {
                    return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
                })[0];
                setLatestPath(latestDownload.filename)
            } else {
                setLatestPath('')
            }
        });

        // 获取escapeEnabled的初始值
        chrome.storage.local.get(["escapeEnabled"], (result) => {
            setEscapeEnabled(result.escapeEnabled ?? true)
        })
    }, [])

    const escapeSpecialChars = (str: string): string => {
        if (currentOS === "Windows") {
            // Windows系统: 在整个路径外层加上双引号
            return `"${str}"`;
        } else {
            // 其他系统(Unix, Mac): 只转义空格
            return str.replace(/ /g, '\\ ');
        }
    }

    const copyToClipboard = async () => {
        if (!latestPath) {
            message.warning("没有可复制的路径")
            return
        }
        try {
            let pathToCopy = latestPath
            if (escapeEnabled) {
                pathToCopy = escapeSpecialChars(latestPath)
            }
            const success = await textToClipboard(pathToCopy)
            if (success) {
                message.success("路径已复制到剪贴板")
            } else {
                message.error("复制失败")
            }
        } catch (err) {
            message.error("复制失败")
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ marginBottom: "0px" }}>
                <ToggleSwitch />
            </div>
            <div style={{ marginBottom: "8px" }}>
                <EscapeToggle onToggle={(checked) => setEscapeEnabled(checked)} />
            </div>
            <p>最新下载文件路径:</p>
            <p style={{ wordBreak: "break-all" }}>{latestPath || "暂无下载记录"}</p>
            <Button
                icon={<CopyOutlined />}
                onClick={copyToClipboard}
                disabled={!latestPath}
            >
                复制路径
            </Button>
        </div>
    )
}