import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
} from '@angular/core';
import { CodeHighlightService } from '@ztp/demo/utils';
import { moduleLoadingService, moduleProviders } from './scrolling.code';

@Component({
  selector: 'ztp-scrolling',
  templateUrl: './scrolling.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollingComponent implements AfterViewInit {
  constructor(private highlightService: CodeHighlightService) {}

  moduleProviders = moduleProviders;
  moduleLoadingService = moduleLoadingService;

  ngAfterViewInit() {
    this.highlightService.highlightAll();
  }
}
