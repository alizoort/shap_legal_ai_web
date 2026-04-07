import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelPermissionGuard } from '../shared/guards/panel-permission.guard';
import { SideBarShellPageComponent } from './shell/pages/side-bar-shell.page';

export const SIDE_BAR_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'legal-ai',
  },
  {
    path: ':panel',
    component: SideBarShellPageComponent,
    canActivate: [PanelPermissionGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(SIDE_BAR_ROUTES)],
  exports: [RouterModule],
})
export class SideBarRoutingModule {}
