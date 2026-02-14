import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PageBreakUtil } from '../utils/page-break.util';

@Component({
  selector: 'app-download-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './download-template.component.html',
  styleUrls: ['./download-template.component.scss']
})
export class DownloadTemplateComponent implements AfterViewInit {
  @ViewChild('contentToDownload', { static: false }) contentToDownload!: ElementRef;
  
  private generatedPdf: jsPDF | null = null;
  isGenerating = false;

  async ngAfterViewInit() {
    await this.generatePDF();
  }

  async generatePDF() {
    this.isGenerating = true;
    const element = this.contentToDownload.nativeElement;
    const margin = 15;
    const contentWidth = 180;
    const contentHeight = 267;
    const scale = 2;
    
    const pxPerMm = (element.offsetWidth * scale) / contentWidth;
    const pxPageHeight = contentHeight * pxPerMm;
    
    PageBreakUtil.insertPageBreaks(element, pxPageHeight / scale);
    
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    const pxToMm = imgHeight / canvas.height;
    
    let currentY = 0;
    let pageNumber = 0;
    
    while (currentY < imgHeight) {
      if (pageNumber > 0) pdf.addPage();
      
      const pageContentHeight = Math.min(contentHeight, imgHeight - currentY);
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
        pdf.addImage(pageImgData, 'PNG', margin, margin, contentWidth, pageContentHeight);
      }
      
      currentY += pageContentHeight;
      pageNumber++;
      
      if (pageNumber > 100) break;
    }

    this.generatedPdf = pdf;
    this.isGenerating = false;
  }

  downloadPDF() {
    if (this.generatedPdf) {
      this.generatedPdf.save('income-report.pdf');
    }
  }
}
