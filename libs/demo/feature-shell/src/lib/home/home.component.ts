import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IExample, DemoFacade } from '@ztp/demo/data-access';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'ztp-demo-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoHomeComponent implements OnInit {
  title = 'Home - Zero To Production';
  description = 'Full Stack Monorepo Starter';
  examples$: Observable<IExample[]>;
  constructor(
    private facade: DemoFacade,
    private meta: Meta,
    private titleService: Title
  ) {
    this.examples$ = this.facade.examples$;
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
    this.meta.updateTag({ name: 'description', content: this.description });
  }

  trackExample(i: number, e: IExample) {
    return e.url;
  }
}
