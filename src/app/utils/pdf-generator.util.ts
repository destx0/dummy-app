import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export class PdfGenerator {
  private static readonly MARGIN = 15;
  private static readonly CONTENT_WIDTH = 180;
  private static readonly CONTENT_HEIGHT = 267;
  private static readonly SCALE = 2;

  static async generate(element: HTMLElement): Promise<jsPDF> {
    const pxPerMm = (element.offsetWidth * this.SCALE) / this.CONTENT_WIDTH;
    const pxPageHeight = this.CONTENT_HEIGHT * pxPerMm;
    
    this.insertPageBreaks(element, pxPageHeight / this.SCALE);
    
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
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgHeight = (canvas.height * this.CONTENT_WIDTH) / canvas.width;
    const pxToMm = imgHeight / canvas.height;
    
    let currentY = 0;
    let pageNumber = 0;
    
    while (currentY < imgHeight && pageNumber < 100) {
      if (pageNumber > 0) pdf.addPage();
      
      const pageContentHeight = Math.min(this.CONTENT_HEIGHT, imgHeight - currentY);
      const sourceY = currentY / pxToMm;
      const sourceHeight = pageContentHeight / pxToMm;
      
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      
      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, sourceHeight);
        ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
        
        const pageImgData = pageCanvas.toDataURL('image/png');
        pdf.addImage(pageImgData, 'PNG', this.MARGIN, this.MARGIN, this.CONTENT_WIDTH, pageContentHeight);
      }
      
      currentY += pageContentHeight;
      pageNumber++;
    }

    return pdf;
  }
}
