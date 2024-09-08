import { useState, useEffect } from "react"
import { Switch } from "antd"
import { currentOS } from "~src/utils/osDetector"

export function ToggleSwitch() {
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    console.log("ToggleSwitch: 初始化")
    chrome.storage.local.get(["copyDisabled"], (result) => {
      console.log("ToggleSwitch: 从存储中获取状态", result)
      setIsDisabled(result.copyDisabled ?? false)
    })
  }, [])

  const handleToggle = (checked: boolean) => {
    const newDisabledState = !checked
    console.log("ToggleSwitch: 切换状态", newDisabledState)
    setIsDisabled(newDisabledState)
    chrome.storage.local.set({ copyDisabled: newDisabledState }, () => {
      if (chrome.runtime.lastError) {
        console.error("ToggleSwitch: 保存状态到存储失败", chrome.runtime.lastError)
      } else {
        console.log("ToggleSwitch: 状态已保存到存储")
      }
    })
    
    chrome.runtime.sendMessage({ action: "toggleCopy", disabled: newDisabledState }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("ToggleSwitch: 发送消息到background失败", chrome.runtime.lastError)
      } else {
        console.log("ToggleSwitch: 发送消息到background成功", response)
      }
    })
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>启用自动复制: </span>
      <Switch checked={!isDisabled} onChange={handleToggle} />
    </div>
  )
}

export function EscapeToggle({ onToggle }: { onToggle?: (checked: boolean) => void }) {
  const [isEscaped, setIsEscaped] = useState(false)

  useEffect(() => {
    chrome.storage.local.get(["escapeEnabled"], (result) => {
      const initialValue = result.escapeEnabled ?? true
      setIsEscaped(initialValue)
      onToggle?.(initialValue)
    })
  }, [onToggle])

  const handleToggle = (checked: boolean) => {
    setIsEscaped(checked)
    chrome.storage.local.set({ escapeEnabled: checked })
    chrome.runtime.sendMessage({ action: "toggleEscape", enabled: checked })
    onToggle?.(checked)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{currentOS === "Windows" ? '路径添加引号' : '转义空格'}: </span>
      <Switch checked={isEscaped} onChange={handleToggle} />
    </div>
  )
}