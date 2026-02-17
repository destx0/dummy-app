export class PdfGenerator {
  // A4 page dimensions at 96 DPI
  private static readonly A4_HEIGHT_MM = 297;
  private static readonly MM_TO_PX = 3.7795275591; // 96 DPI conversion
  private static readonly PAGE_MARGIN_PX = 40; // Top and bottom margins from @page
  
  // Calculate effective page height
  private static readonly FULL_PAGE_HEIGHT_PX = this.A4_HEIGHT_MM * this.MM_TO_PX; // ~1122.52px
  private static readonly CONTENT_PAGE_HEIGHT_PX = this.FULL_PAGE_HEIGHT_PX - (2 * this.PAGE_MARGIN_PX);

  /**
   * Inserts dynamic page break spacers to prevent elements from splitting across pages
   * @param container The container element to process
   * @param avoidSelectors CSS selectors for elements that should not be split
   */
  static insertPageBreaks(
    container: HTMLElement,
    avoidSelectors: string = '.income-card, h1, h2, h3, .summary, .table-section, table'
  ): void {
    // Remove any existing page break spacers
    const existingSpacers = container.querySelectorAll('.page-break-spacer');
    existingSpacers.forEach((spacer: Element) => spacer.remove());
    
    // Use content page height (full page minus top and bottom margins)
    const pxPageHeight = this.CONTENT_PAGE_HEIGHT_PX;
    
    // Get all elements that should avoid page breaks
    const avoidElements = Array.from(container.querySelectorAll(avoidSelectors));
    
    // Get container's top position for relative calculations
    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top;
    
    // Loop through all elements that should avoid breaks
    avoidElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      
      // Get element position relative to viewport
      const clientRect = htmlEl.getBoundingClientRect();
      
      // Calculate position relative to container top
      const elementTop = clientRect.top - containerTop;
      const elementBottom = clientRect.bottom - containerTop;
      
      // Avoid: Check if a break happens mid-element
      const startPage = Math.floor(elementTop / pxPageHeight);
      const endPage = Math.floor(elementBottom / pxPageHeight);
      const nPages = Math.abs(elementBottom - elementTop) / pxPageHeight;
      
      // If element is broken across pages and is at most one page long, add spacer
      if (endPage !== startPage && nPages <= 1) {
        // Create a padding div to push the element to the next page
        const pad = document.createElement('div');
        pad.style.display = 'block';
        pad.style.height = (pxPageHeight - (elementTop % pxPageHeight)) + 'px';
        pad.className = 'page-break-spacer';
        htmlEl.parentNode?.insertBefore(pad, htmlEl);
      }
    });
  }

  /**
   * Triggers the browser's print dialog for PDF generation
   */
  static print(): void {
    window.print();
  }
}
