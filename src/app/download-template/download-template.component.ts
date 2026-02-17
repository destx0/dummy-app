import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfGenerator } from '../utils/pdf-generator.util';

@Component({
  selector: 'app-download-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './download-template.component.html',
  styleUrls: ['./download-template.component.scss']
})
export class DownloadTemplateComponent {
  @ViewChild('contentToDownload', { static: false }) contentToDownload!: ElementRef;
  
  isGenerating = false;
  generatedAt: Date | null = null;

  async generatePDF() {
    if (this.isGenerating) return;
    
    this.isGenerating = true;
    
    try {
      this.generatedAt = new Date();
      await new Promise(resolve => setTimeout(resolve, 100));
      PdfGenerator.insertPageBreaks(this.contentToDownload.nativeElement);
    } catch (error) {
      console.error('PDF generation failed:', error);
      this.generatedAt = null;
    } finally {
      this.isGenerating = false;
    }
  }

  async downloadPDF() {
    if (!this.generatedAt) await this.generatePDF();
    PdfGenerator.print();
  }
}
