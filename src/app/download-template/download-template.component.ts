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

  async downloadPDF() {
    if (this.isGenerating) return;
    
    this.isGenerating = true;
    
    try {
      const pdf = await PdfGenerator.generate(this.contentToDownload.nativeElement);
      pdf.save('income-report.pdf');
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      this.isGenerating = false;
    }
  }
}
