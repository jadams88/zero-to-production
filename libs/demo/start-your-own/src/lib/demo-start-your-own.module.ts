import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GuidesComponent } from './guides/guides.component';

@NgModule({
  imports: [RouterModule],
  declarations: [GuidesComponent],
})
export class DemoStartYourOwnModule {
  static get lazyEntryComponent() {
    return GuidesComponent;
  }
}
