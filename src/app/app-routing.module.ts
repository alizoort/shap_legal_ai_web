import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'sideBar/legal-ai',
  },
  {
    path: 'sideBar',
    loadChildren: () => import('./side-bar/side-bar.module').then((module) => module.SideBarModule),
  },
  {
    path: '**',
    redirectTo: 'sideBar/legal-ai',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
