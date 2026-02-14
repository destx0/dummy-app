import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-download-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './download-template.component.html',
  styleUrls: ['./download-template.component.scss']
})
export class DownloadTemplateComponent {
  @ViewChild('contentToDownload', { static: false }) contentToDownload!: ElementRef;

  async downloadAsPDF() {
    const element = this.contentToDownload.nativeElement;
    
    // PDF configuration with margins
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 15; // margin in mm
    const contentWidth = pageWidth - (2 * margin);
    const contentHeight = pageHeight - (2 * margin);
    
    // Get the actual width of the element
    const elementWidth = element.offsetWidth;
    
    // Calculate the scale factor that will be used
    const scale = 2;
    
    // Calculate how many pixels in the canvas will represent one page height
    // First, get the ratio of element width to PDF content width
    const pxPerMm = (elementWidth * scale) / contentWidth;
    
    // Now calculate page height in canvas pixels
    const pxPageHeight = contentHeight * pxPerMm;
    
    // Insert padding divs to handle page breaks BEFORE rendering
    this.insertPageBreaks(element, pxPageHeight / scale); // Use unscaled height for DOM measurements
    
    // Create canvas of full content AFTER padding divs are inserted
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Now split the canvas into pages
    let currentY = 0;
    let pageNumber = 0;
    
    while (currentY < imgHeight) {
      if (pageNumber > 0) {
        pdf.addPage();
      }
      
      const remainingHeight = imgHeight - currentY;
      const pageContentHeight = Math.min(contentHeight, remainingHeight);
      
      // Calculate pixel to mm ratio
      const pxToMm = imgHeight / canvas.height;
      const sourceY = currentY / pxToMm;
      const sourceHeight = pageContentHeight / pxToMm;
      
      // Create a temporary canvas for this page slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      
      const pageCtx = pageCanvas.getContext('2d');
      if (pageCtx) {
        pageCtx.fillStyle = 'white';
        pageCtx.fillRect(0, 0, canvas.width, sourceHeight);
        
        pageCtx.drawImage(
          canvas,
          0, sourceY,
          canvas.width, sourceHeight,
          0, 0,
          canvas.width, sourceHeight
        );
        
        const pageImgData = pageCanvas.toDataURL('image/png');
        pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, pageContentHeight);
      }
      
      currentY += pageContentHeight;
      pageNumber++;
      
      if (pageNumber > 100) {
        console.warn('Too many pages, stopping PDF generation');
        break;
      }
    }

    pdf.save('income-report.pdf');
  }

  private insertPageBreaks(container: HTMLElement, pxPageHeight: number): void {
    // Get all elements that should not be split
    const avoidElements = container.querySelectorAll('.income-card, h1, h2, h3, table thead, table tbody tr');
    
    avoidElements.forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      const clientRect = htmlEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Calculate position relative to container
      const relativeTop = clientRect.top - containerRect.top;
      const relativeBottom = clientRect.bottom - containerRect.top;
      
      // Check if element would be split across pages
      const startPage = Math.floor(relativeTop / pxPageHeight);
      const endPage = Math.floor(relativeBottom / pxPageHeight);
      const nPages = Math.abs(relativeBottom - relativeTop) / pxPageHeight;
      
      // If element is broken across pages and is at most one page long
      if (endPage !== startPage && nPages <= 1) {
        // Create padding div to push element to next page
        const paddingHeight = pxPageHeight - (relativeTop % pxPageHeight);
        const pad = document.createElement('div');
        pad.style.display = 'block';
        pad.style.height = paddingHeight + 'px';
        pad.className = 'page-break-padding';
        
        // Insert before the element
        htmlEl.parentNode?.insertBefore(pad, htmlEl);
      }
    });
  }
}
