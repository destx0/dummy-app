import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DownloadTemplateComponent } from './download-template/download-template.component';
import { IncomeContentComponent } from './income-content/income-content.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DownloadTemplateComponent, IncomeContentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild(DownloadTemplateComponent) downloadTemplate!: DownloadTemplateComponent;
  
  title = 'dummy-app';

  async downloadPDF() {
    if (this.downloadTemplate) {
      await this.downloadTemplate.downloadPDF();
    }
  }

  get isGenerating(): boolean {
    return this.downloadTemplate?.isGenerating || false;
  }
}
