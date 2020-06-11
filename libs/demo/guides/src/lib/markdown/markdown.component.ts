import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnDestroy,
} from '@angular/core';
import { MarkdownService } from '@ztp/demo/utils';
import { Observable, Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'ztp-demo-markdown',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MarkdownComponent implements OnDestroy {
  private sub: Subscription;
  markdown$: Observable<string>;
  constructor(
    private mdService: MarkdownService,
    private route: ActivatedRoute,
    private meta: Meta
  ) {
    this.markdown$ = this.route.data.pipe(
      filter((val) => val !== undefined),
      switchMap(({ guide }) => this.mdService.loadMarkdown(guide))
    );

    this.sub = this.route.data
      .pipe(filter((val) => val !== undefined))
      .subscribe(({ description }) => {
        this.meta.updateTag({
          name: 'description',
          content: `Guide to ${description}`,
        });
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
