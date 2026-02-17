export class PdfGenerator {
  private static readonly A4_HEIGHT_MM = 297;
  private static readonly MM_TO_PX = 3.7795275591;
  private static readonly PAGE_MARGIN_PX = 40;
  private static readonly FULL_PAGE_HEIGHT_PX = this.A4_HEIGHT_MM * this.MM_TO_PX;
  private static readonly CONTENT_PAGE_HEIGHT_PX = this.FULL_PAGE_HEIGHT_PX - (2 * this.PAGE_MARGIN_PX);

  static insertPageBreaks(
    container: HTMLElement,
    avoidSelectors: string = '.income-card, h1, h2, h3, .summary, .table-section, table'
  ): void {
    const existingSpacers = container.querySelectorAll('.page-break-spacer');
    existingSpacers.forEach((spacer: Element) => spacer.remove());
    
    const pxPageHeight = this.CONTENT_PAGE_HEIGHT_PX;
    const avoidElements = Array.from(container.querySelectorAll(avoidSelectors));
    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top;
    
    avoidElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const clientRect = htmlEl.getBoundingClientRect();
      const elementTop = clientRect.top - containerTop;
      const elementBottom = clientRect.bottom - containerTop;
      
      const startPage = Math.floor(elementTop / pxPageHeight);
      const endPage = Math.floor(elementBottom / pxPageHeight);
      const nPages = Math.abs(elementBottom - elementTop) / pxPageHeight;
      
      if (endPage !== startPage && nPages <= 1) {
        const pad = document.createElement('div');
        pad.style.display = 'block';
        pad.style.height = (pxPageHeight - (elementTop % pxPageHeight)) + 'px';
        pad.className = 'page-break-spacer';
        htmlEl.parentNode?.insertBefore(pad, htmlEl);
      }
    });
  }

  static print(): void {
    window.print();
  }
}
