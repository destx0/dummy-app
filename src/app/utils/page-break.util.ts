export class PageBreakUtil {
  static insertPageBreaks(container: HTMLElement, pxPageHeight: number): void {
    const avoidSelectors = '.income-card, h1, h2, h3, table thead, table tbody tr';
    let avoidElements = Array.from(container.querySelectorAll(avoidSelectors));
    
    // Process elements one at a time and recalculate after each insertion
    let i = 0;
    while (i < avoidElements.length) {
      const htmlEl = avoidElements[i] as HTMLElement;
      const containerRect = container.getBoundingClientRect();
      const rect = htmlEl.getBoundingClientRect();
      
      const relativeTop = rect.top - containerRect.top;
      const relativeBottom = rect.bottom - containerRect.top;
      
      const startPage = Math.floor(relativeTop / pxPageHeight);
      const endPage = Math.floor(relativeBottom / pxPageHeight);
      const nPages = (relativeBottom - relativeTop) / pxPageHeight;
      
      if (endPage !== startPage && nPages <= 1) {
        const pad = document.createElement('div');
        pad.style.display = 'block';
        pad.style.height = (pxPageHeight - (relativeTop % pxPageHeight)) + 'px';
        htmlEl.parentNode?.insertBefore(pad, htmlEl);
        
        // Recalculate element list after DOM modification
        avoidElements = Array.from(container.querySelectorAll(avoidSelectors));
      } else {
        i++;
      }
    }
  }
}
