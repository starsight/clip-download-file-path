export async function textToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            console.log('主方案 copy to clipboard successfully');
            return true;
        } catch (err) {
            console.error('主方案 Failed to copy: ', err);
            return fallbackCopyToClipboard(text);
        }
    } else {
        return fallbackCopyToClipboard(text);
    }

    
    function fallbackCopyToClipboard(text: string): boolean {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
          const successful = document.execCommand('copy');
          const msg = successful ? 'successful' : 'unsuccessful';
          console.log('备用方案 copy to clipboard ' + msg);
          return successful;
      } catch (err) {
          console.error('备用方案: Failed to copy', err);
          return false;
      } finally {
          document.body.removeChild(textArea);
      }
  }
}
