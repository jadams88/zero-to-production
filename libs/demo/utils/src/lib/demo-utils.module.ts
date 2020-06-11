import { NgModule } from '@angular/core';
import { CodeHighlightPipe } from './highlight.pipe';

@NgModule({
  declarations: [CodeHighlightPipe],
  exports: [CodeHighlightPipe],
})
export class DemoUtilsModule {}
