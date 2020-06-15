import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CodeHighlightService } from '@ztp/demo/utils';
import { moduleLoadingService, moduleProviders } from './scrolling.code';

@Component({
  selector: 'ztp-scrolling-example',
  templateUrl: './scrolling-example.component.html',
  styles: [
    `
      .view-port {
        height: 400px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollingExampleComponent implements OnInit, AfterViewInit {
  title = 'Demo - Zero To Production';
  description = 'Advanced Angular demos';

  moduleProviders = moduleProviders;
  moduleLoadingService = moduleLoadingService;

  constructor(
    private highlightService: CodeHighlightService,
    private titleService: Title,
    private meta: Meta
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
    this.meta.updateTag({
      name: 'description',
      content: this.description,
    });
  }

  ngAfterViewInit() {
    this.highlightService.highlightAll();
  }
}
