export function parseMarkdown(text: string): string {
  if (!text) return "";

  // Bold (**text** or __text__)
  let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Italics (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Inline code (`code`)
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");

  // Headers (e.g. ### Header)
  html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

  // Lists
  const lines = html.split("\n");
  let inList = false;
  const processed = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      const content = trimmed.substring(2);
      if (!inList) {
        inList = true;
        return `<ul><li>${content}</li>`;
      }
      return `<li>${content}</li>`;
    } else {
      if (inList) {
        inList = false;
        return `</ul>${trimmed ? `<p>${line}</p>` : ""}`;
      }
      return trimmed ? `<p>${line}</p>` : "";
    }
  });

  if (inList) {
    processed.push("</ul>");
  }

  return processed.join("\n");
}
