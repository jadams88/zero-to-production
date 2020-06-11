import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuidesComponent } from './guides/guides.component';

const ROUTES: Routes = [{ path: '', component: GuidesComponent }];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  declarations: [GuidesComponent],
})
export class DemoStartYourOwnModule {
  static get lazyEntryComponent() {
    return GuidesComponent;
  }
}
