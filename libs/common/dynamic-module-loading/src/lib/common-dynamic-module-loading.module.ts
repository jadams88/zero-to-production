import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentFactorRendererDirective } from './factory-renderer.directive';
import { LazyLoadScrollDirective } from './scroll/lazy-load-scroll.directive';
import { ModuleLoaderService } from './module-loader.service';
import { LazyViewportComponent } from './scroll/lazy-viewport.component';

const DECLARATIONS = [
  LazyViewportComponent,
  ComponentFactorRendererDirective,
  LazyLoadScrollDirective,
];

@NgModule({
  imports: [CommonModule],
  declarations: DECLARATIONS,
  exports: DECLARATIONS,
  providers: [ModuleLoaderService],
})
export class CommonDynamicModuleLoadingModule {}
