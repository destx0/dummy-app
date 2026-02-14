import { Component } from '@angular/core';
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
  title = 'dummy-app';
}
