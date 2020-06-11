import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { GUIDES } from '../guides';

@Component({
  selector: 'ztp-demo-guides',
  templateUrl: './guides.component.html',
  styleUrls: ['./guides.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuidesComponent implements OnInit {
  title = 'Guides - Zero To Production';
  guides = GUIDES;

  constructor(private titleService: Title) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }
}
