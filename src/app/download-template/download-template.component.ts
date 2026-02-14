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
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 15; // margin in mm
    const contentWidth = pageWidth - (2 * margin);
    const contentHeight = pageHeight - (2 * margin);
    
    // Get all elements that should not be split
    const avoidBreakElements = this.getAvoidBreakElements(element);
    
    // Create canvas of full content
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Calculate pixel to mm ratio
    const pxToMm = imgHeight / canvas.height;
    
    // Smart page break algorithm
    let currentY = 0;
    let pageNumber = 0;
    
    while (currentY < imgHeight) {
      if (pageNumber > 0) {
        pdf.addPage();
      }
      
      // Calculate remaining height on current page
      const remainingHeight = imgHeight - currentY;
      let pageContentHeight = Math.min(contentHeight, remainingHeight);
      
      // Check for elements that shouldn't be split
      const breakPoint = this.findOptimalBreakPoint(
        avoidBreakElements,
        currentY,
        currentY + pageContentHeight,
        pxToMm,
        contentHeight
      );
      
      if (breakPoint !== null) {
        pageContentHeight = breakPoint - currentY;
        
        // Ensure we have a minimum page height
        if (pageContentHeight < contentHeight * 0.1 && pageNumber > 0) {
          // Page would be too small, skip to next page
          currentY = breakPoint;
          continue;
        }
      }
      
      // Calculate source position in pixels
      const sourceY = currentY / pxToMm;
      const sourceHeight = pageContentHeight / pxToMm;
      
      // Create a temporary canvas for this page slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      
      const pageCtx = pageCanvas.getContext('2d');
      if (pageCtx) {
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
      
      // Safety check to prevent infinite loop
      if (pageNumber > 100) {
        console.warn('Too many pages, stopping PDF generation');
        break;
      }
    }

    pdf.save('income-report.pdf');
  }

  private getAvoidBreakElements(container: HTMLElement): Array<{top: number, bottom: number, height: number}> {
    const elements: Array<{top: number, bottom: number, height: number}> = [];
    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top + window.scrollY;
    
    // Select elements that should not be split
    const selectors = [
      '.income-card',
      'h1', 'h2', 'h3',
      'table thead',
      'table tbody tr'
    ];
    
    selectors.forEach(selector => {
      const nodeList = container.querySelectorAll(selector);
      nodeList.forEach(el => {
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY - containerTop;
        const bottom = top + rect.height;
        
        elements.push({
          top,
          bottom,
          height: rect.height
        });
      });
    });
    
    return elements.sort((a, b) => a.top - b.top);
  }

  private findOptimalBreakPoint(
    elements: Array<{top: number, bottom: number, height: number}>,
    pageStart: number,
    pageEnd: number,
    pxToMm: number,
    maxPageHeight: number
  ): number | null {
    const pageStartPx = pageStart / pxToMm;
    const pageEndPx = pageEnd / pxToMm;
    
    // Find elements that would be split by this page break
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      
      // Check if element is split by the page break
      if (element.top < pageEndPx && element.bottom > pageEndPx) {
        // Element would be split
        
        // If element is too large to fit on a page, allow split
        const elementHeightMm = element.height * pxToMm;
        if (elementHeightMm > maxPageHeight * 0.9) {
          continue;
        }
        
        // Always try to break before this element to keep it intact
        const breakBeforeMm = element.top * pxToMm;
        
        // Check if the element can fit on the next page
        if (elementHeightMm <= maxPageHeight) {
          return breakBeforeMm;
        }
        
        // If element can't fit on next page either, try breaking after
        const breakAfterMm = element.bottom * pxToMm;
        return breakAfterMm;
      }
    }
    
    return null;
  }
}
