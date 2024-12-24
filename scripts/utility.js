'use-strict'

export function getProblemName(url) {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/");
  return pathParts[pathParts.length - 1];
}

export function scrollToBottom(container) {
  container.scrollTo({
    top: container.scrollHeight,
    behavior: "smooth",
  });
}