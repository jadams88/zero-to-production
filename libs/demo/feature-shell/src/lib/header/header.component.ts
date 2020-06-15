import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ztp-demo-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoHeaderComponent {
  navRoutes = [
    { label: 'Home', link: '/home', aria: 'home' },
    { label: 'Guides', link: '/guides', aria: 'guides' },
    { label: 'Examples', link: '/examples', aria: 'examples' },
  ];
}
