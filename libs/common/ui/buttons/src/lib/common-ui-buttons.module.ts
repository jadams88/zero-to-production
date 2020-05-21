import { NgModule } from '@angular/core';
import { RaisedButtonComponent } from './raised-button/raised-button.component';
import { IconButtonComponent } from './icon-button/icon-button.component';

@NgModule({
  declarations: [RaisedButtonComponent, IconButtonComponent],
  exports: [RaisedButtonComponent, IconButtonComponent],
})
export class CommonUiButtonsModule {}
