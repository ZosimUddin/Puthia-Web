/**
 * Safely copy text to clipboard with fallback for unfocused document or iframe constraints.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("Clipboard API writeText failed, attempting execCommand fallback:", err);
  }

  // Fallback for non-secure context or unfocused document in iframe
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Fallback execCommand copy failed:", err);
    return false;
  }
}
