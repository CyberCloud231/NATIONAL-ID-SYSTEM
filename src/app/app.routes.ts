import { Routes } from '@angular/router';
import { WelcomeDashboard } from './welcome-dashboard/welcome-dashboard';
import { AuthLogin } from './auth-login/auth-login';
import { AuthSignup } from './auth-signup/auth-signup';
import { HomeDashboard } from './home-dashboard/home-dashboard';

export const routes: Routes = [
  {path: '', redirectTo: 'welcome', pathMatch: 'full'},
  {path: 'welcomeDashboard', component:WelcomeDashboard},
  {path:"home", component:HomeDashboard},
  {path: "login", component:AuthLogin},
  {path: "sigup", component:AuthSignup}
];
