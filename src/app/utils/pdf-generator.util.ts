import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export class PdfGenerator {
  private static readonly PAGE_WIDTH_PX = 794;  // A4 width at 96 DPI
  private static readonly PAGE_HEIGHT_PX = 1123; // A4 height at 96 DPI
  private static readonly MARGIN_PX = 57;        // 15mm in pixels
  private static readonly SCALE = 2;

  static async generate(element: HTMLElement): Promise<jsPDF> {
    const contentHeightPx = this.PAGE_HEIGHT_PX - (2 * this.MARGIN_PX);
    
    this.insertPageBreaks(element, contentHeightPx);
    
    const canvas = await html2canvas(element, {
      scale: this.SCALE,
      useCORS: true,
      logging: false
    });

    return this.createPdfFromCanvas(canvas);
  }

  private static insertPageBreaks(container: HTMLElement, pxPageHeight: number): void {
    const avoidSelectors = '.income-card, h1, h2, h3, table thead, table tbody tr';
    let modified = true;
    
    while (modified) {
      modified = false;
      const avoidElements = Array.from(container.querySelectorAll(avoidSelectors));
      const containerRect = container.getBoundingClientRect();
      
      for (const el of avoidElements) {
        const htmlEl = el as HTMLElement;
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
          modified = true;
          break;
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
