import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import { PdfGenerator } from '../utils/pdf-generator.util';

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
    this.isGenerating = true;
    this.generatedPdf = await PdfGenerator.generate(this.contentToDownload.nativeElement);
    this.isGenerating = false;
  }

  downloadPDF() {
    if (this.generatedPdf) {
      this.generatedPdf.save('income-report.pdf');
    }
  }
}
