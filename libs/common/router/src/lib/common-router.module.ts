import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterSkipLinkComponent } from './skip-link/skip-link.component';
import { SkipLinkDirective } from './skip-link/skip-link.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [RouterSkipLinkComponent, SkipLinkDirective],
  exports: [RouterSkipLinkComponent, SkipLinkDirective],
})
export class CommonRouterModule {}
