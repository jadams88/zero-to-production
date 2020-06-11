import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ThemeService } from '@ztp/common/utils/theme';
import { Observable } from 'rxjs';
import { AnimationService } from '@ztp/common/animations';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'demo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  darkMode$: Observable<boolean>;
  animationsEnabled$: Observable<boolean>;

  constructor(
    private themeService: ThemeService,
    private animationService: AnimationService,
    private meta: Meta
  ) {
    this.darkMode$ = this.themeService.darkMode$;
    this.animationsEnabled$ = this.animationService.enabled$;
  }

  ngOnInit() {
    this.meta.addTags([
      {
        name: 'keywords',
        content:
          'Zero to production, Monorepo, Angular, GraphQL, Koa, Guides, Kubernetes, Angular Universal',
      },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'Jonathon Adams' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { charset: 'UTF-8' },
    ]);
  }
}
