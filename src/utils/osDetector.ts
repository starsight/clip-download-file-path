export function detectOS() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf("win") > -1) return "Windows";
  if (userAgent.indexOf("mac") > -1) return "MacOS";
  if (userAgent.indexOf("linux") > -1) return "Linux";
  return "Unknown";
}

export const currentOS = detectOS();