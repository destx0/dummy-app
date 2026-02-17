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
    
    // Insert page breaks without blocking
    await this.yieldToMain();
    this.insertPageBreaks(element, actualPageHeight);
    
    // Render canvas without blocking
    await this.yieldToMain();
    const canvas = await html2canvas(element, {
      scale: this.SCALE,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const injectedStyles = clonedDoc.querySelectorAll('style');
        injectedStyles.forEach(style => {
          const content = style.textContent || '';
          if (content.includes('var(--')) {
            style.remove();
          }
        });
      }
    });

    // Create PDF without blocking
    await this.yieldToMain();
    return this.createPdfFromCanvas(canvas);
  }

  private static yieldToMain(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  private static insertPageBreaks(container: HTMLElement, pxPageHeight: number): void {
    const avoidSelectors = '.income-card, h1, h2, h3, table thead, table tbody tr';
    
    let modified = true;
    while (modified) {
      modified = false;
      const avoidElements = Array.from(container.querySelectorAll(avoidSelectors));
      
      for (const el of avoidElements) {
        const htmlEl = el as HTMLElement;
        const rect = htmlEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const elementTop = rect.top - containerRect.top;
        const elementBottom = rect.bottom - containerRect.top;
        
        const startPage = Math.floor(elementTop / pxPageHeight);
        const endPage = Math.floor(elementBottom / pxPageHeight);
        const elementPages = (elementBottom - elementTop) / pxPageHeight;
        
        if (endPage !== startPage && elementPages <= 1) {
          const paddingHeight = pxPageHeight - (elementTop % pxPageHeight);
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

  private static async createPdfFromCanvas(canvas: HTMLCanvasElement): Promise<jsPDF> {
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
      
      // Yield to main thread every 3 pages
      if (pageNumber % 3 === 0) {
        await this.yieldToMain();
      }
    }

    return pdf;
  }
}
