import { CanExitGuard } from './common/can-exit-guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { AuthGuardLogin } from './login/authguard.login';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    // {
    //     path: 'userts',
    //     component: TimesheetComponent,
    //     canActivate: [AuthGuardLogin]
    // },
    {
        path: 'home',
        component: HomeComponent,
        children: [
            // {
            //     path: 'timesheet',
            //     component: TimesheetComponent,
            //     canActivate: [AuthGuardLogin],
            //     canDeactivate: [CanExitGuard]
            // },
        ]
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
