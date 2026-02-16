import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export class PdfGenerator {
  private static readonly PAGE_WIDTH_PX = 794;
  private static readonly PAGE_HEIGHT_PX = 1123;
  private static readonly MARGIN_PX = 57;
  private static readonly SCALE = 2;

  static async generate(element: HTMLElement): Promise<jsPDF> {
    const contentHeightPx = this.PAGE_HEIGHT_PX - (2 * this.MARGIN_PX);
    
    const elementWidth = element.offsetWidth;
    const contentWidthPx = this.PAGE_WIDTH_PX - (2 * this.MARGIN_PX);
    const scaleFactor = contentWidthPx / elementWidth;
    const actualPageHeight = contentHeightPx / scaleFactor;
    
    this.insertPageBreaks(element, actualPageHeight);
    
    const canvas = await html2canvas(element, {
      scale: this.SCALE,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        // Remove all injected extension styles (Dark Reader, Night Eye, etc.)
        const injectedStyles = clonedDoc.querySelectorAll('style:not([data-vite-dev-id]):not([type="text/css"][data-styled])');
        injectedStyles.forEach(style => {
          const content = style.textContent || '';
          // Remove styles that contain CSS variables or extension-specific patterns
          if (content.includes('--darkreader') || 
              content.includes('--nighteye') || 
              content.includes('var(--') ||
              content.includes('[data-darkreader]') ||
              content.includes('[data-nighteye]')) {
            style.remove();
          }
        });
        
        // Force original colors on all elements
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach(el => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.filter = 'none';
        });
      }
    });

    return this.createPdfFromCanvas(canvas);
  }

  private static insertPageBreaks(container: HTMLElement, pxPageHeight: number): void {
    const avoidSelectors = '.income-card, h1, h2, h3, table thead, table tbody tr';
    
    // Process all elements multiple times until no more padding is needed
    let modified = true;
    while (modified) {
      modified = false;
      const avoidElements = Array.from(container.querySelectorAll(avoidSelectors));
      
      for (const el of avoidElements) {
        const htmlEl = el as HTMLElement;
        const rect = htmlEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Position relative to container (matching html2pdf logic)
        const elementTop = rect.top - containerRect.top;
        const elementBottom = rect.bottom - containerRect.top;
        
        // Check which page the element starts and ends on
        const startPage = Math.floor(elementTop / pxPageHeight);
        const endPage = Math.floor(elementBottom / pxPageHeight);
        const elementPages = (elementBottom - elementTop) / pxPageHeight;
        
        // If element spans pages and fits in one page, push to next page
        if (endPage !== startPage && elementPages <= 1) {
          const paddingHeight = pxPageHeight - (elementTop % pxPageHeight);
          const pad = document.createElement('div');
          pad.style.display = 'block';
          pad.style.height = paddingHeight + 'px';
          pad.className = 'page-break-spacer';
          
          htmlEl.parentNode?.insertBefore(pad, htmlEl);
          modified = true;
          break; // Recalculate after each insertion
        }
      }
    }
  }

  private static createPdfFromCanvas(canvas: HTMLCanvasElement): jsPDF {
    const pdf = new jsPDF('p', 'px', [this.PAGE_WIDTH_PX, this.PAGE_HEIGHT_PX]);
    const contentWidthPx = this.PAGE_WIDTH_PX - (2 * this.MARGIN_PX);
    const contentHeightPx = this.PAGE_HEIGHT_PX - (2 * this.MARGIN_PX);
    
    const canvasHeightPx = (canvas.height * contentWidthPx) / canvas.width;
    const pxRatio = canvasHeightPx / canvas.height;
    
    let currentY = 0;
    let pageNumber = 0;
    
    while (currentY < canvasHeightPx && pageNumber < 100) {
      if (pageNumber > 0) pdf.addPage();
      
      const pageContentHeight = Math.min(contentHeightPx, canvasHeightPx - currentY);
      const sourceY = currentY / pxRatio;
      const sourceHeight = pageContentHeight / pxRatio;
      
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      
      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, sourceHeight);
        ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
        
        const pageImgData = pageCanvas.toDataURL('image/png');
        pdf.addImage(pageImgData, 'PNG', this.MARGIN_PX, this.MARGIN_PX, contentWidthPx, pageContentHeight);
      }
      
      currentY += pageContentHeight;
      pageNumber++;
    }

    return pdf;
  }
}
