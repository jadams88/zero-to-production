import { NgModule } from '@angular/core';
import { TodosDataAccessModule } from '@ngw/todos/data-access';
import { AllTodosModule } from '@ngw/todos/all-todos';
import { TodosDetailModule } from '@ngw/todos/todo-detail';
import { SharedFloatingMenuModule } from '@ngw/shared/floating-menu';
import { CommonUiToolbarModule } from '@ngw/common/ui/toolbar';
import { CommonUiSideNavModule } from '@ngw/common/ui/side-nav';
import { CommonUiLayoutsModule } from '@ngw/common/ui/layouts';
import { DataAccessDynamicFormModule } from '@ngw/data-access/dynamic-form';
import { TodosFeatureShellRoutingModule } from './todos-feature-shell-routing.module';
import { TodoFeatureShellComponent } from './todos-feature-shell.component';
import { TodoLayoutComponent } from './ui/todos-layout.component';
import { SharedAuthRoutesModule } from '@ngw/shared/auth-routes';

@NgModule({
  declarations: [TodoFeatureShellComponent, TodoLayoutComponent],
  imports: [
    SharedAuthRoutesModule,
    TodosDataAccessModule,
    AllTodosModule,
    TodosDetailModule,
    DataAccessDynamicFormModule,
    CommonUiSideNavModule,
    CommonUiToolbarModule,
    TodosFeatureShellRoutingModule,
    SharedFloatingMenuModule,
    CommonUiLayoutsModule
  ]
})
export class TodosFeatureShellModule {}
