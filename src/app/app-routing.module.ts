import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AddhostFormComponent} from './addhost-form/addhost-form.component';
import { ClusterDashboardComponent } from './cluster-dashboard/cluster-dashboard.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {LoginComponent} from './login/login.component';

const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'login', component: LoginComponent},
  {path: 'addcluster', component: AddhostFormComponent},
  {path: 'clusterdashboard', component: ClusterDashboardComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
 }
