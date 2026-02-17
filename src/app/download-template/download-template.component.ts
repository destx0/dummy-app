import { Component, ElementRef, ViewChild } from '@angular/core';
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
export class DownloadTemplateComponent {
  @ViewChild('contentToDownload', { static: false }) contentToDownload!: ElementRef;
  @ViewChild('timestamp', { static: false }) timestamp!: ElementRef;
  
  isGenerating = false;
  private generatedPdf: jsPDF | null = null;
  generatedAt: Date | null = null;

  async generatePDF() {
    if (this.isGenerating) return;
    
    this.isGenerating = true;
    
    try {
      this.generatedAt = new Date();
      
      // Wait for Angular to update the DOM with the timestamp
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.generatedPdf = await PdfGenerator.generate(this.contentToDownload.nativeElement);
    } catch (error) {
      console.error('PDF generation failed:', error);
      this.generatedAt = null;
    } finally {
      this.isGenerating = false;
    }
  }

  async downloadPDF() {
    // If not generated yet, generate first
    if (!this.generatedPdf) {
      await this.generatePDF();
    }
    
    // Download if generation was successful
    if (this.generatedPdf) {
      this.generatedPdf.save('income-report.pdf');
    }
  }
}
