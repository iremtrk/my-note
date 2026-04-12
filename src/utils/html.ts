/**
 * HTML string'inden düz metin çıkarır.
 * NoteCard preview, NotesList preview ve arama filtresi için kullanılır.
 */
export function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}