export class PdfGenerator {
  private static readonly PAGE_HEIGHT_PX = 1123;
  private static readonly MARGIN_PX = 57;
  private static readonly CONTENT_HEIGHT_PX = this.PAGE_HEIGHT_PX - (2 * this.MARGIN_PX);

  /**
   * Inserts dynamic page break spacers to prevent elements from splitting across pages
   * @param container The container element to process
   * @param avoidSelectors CSS selectors for elements that should not be split
   */
  static insertPageBreaks(
    container: HTMLElement,
    avoidSelectors: string = '.income-card, h1, h2, h3, table thead, table tbody tr'
  ): void {
    // Remove any existing page break spacers
    const existingSpacers = container.querySelectorAll('.page-break-spacer');
    existingSpacers.forEach((spacer: Element) => spacer.remove());
    
    let modified = true;
    let iterations = 0;
    const maxIterations = 50; // Prevent infinite loops
    
    while (modified && iterations < maxIterations) {
      modified = false;
      iterations++;
      
      const avoidElements = Array.from(container.querySelectorAll(avoidSelectors));
      
      for (const el of avoidElements) {
        const htmlEl = el as HTMLElement;
        const rect = htmlEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const elementTop = rect.top - containerRect.top;
        const elementBottom = rect.bottom - containerRect.top;
        
        const startPage = Math.floor(elementTop / this.CONTENT_HEIGHT_PX);
        const endPage = Math.floor(elementBottom / this.CONTENT_HEIGHT_PX);
        const elementPages = (elementBottom - elementTop) / this.CONTENT_HEIGHT_PX;
        
        // If element spans pages and fits on one page, add spacer
        if (endPage !== startPage && elementPages <= 1) {
          const paddingHeight = this.CONTENT_HEIGHT_PX - (elementTop % this.CONTENT_HEIGHT_PX);
          const pad = document.createElement('div');
          pad.style.display = 'block';
          pad.style.height = paddingHeight + 'px';
          pad.className = 'page-break-spacer';
          htmlEl.parentNode?.insertBefore(pad, htmlEl);
          modified = true;
          break;
        }
      }
    }
  }

  /**
   * Triggers the browser's print dialog for PDF generation
   */
  static print(): void {
    window.print();
  }
}
