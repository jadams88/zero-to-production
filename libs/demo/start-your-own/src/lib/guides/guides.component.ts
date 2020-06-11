import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
} from '@angular/core';
import { CodeHighlightService } from '@ztp/demo/utils';
import { clone } from './guides.code';

@Component({
  selector: 'ztp-guides',
  templateUrl: './guides.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuidesComponent implements AfterViewInit {
  clone = clone;

  constructor(private highlight: CodeHighlightService) {}

  ngAfterViewInit() {
    this.highlight.highlightAll();
  }
}
