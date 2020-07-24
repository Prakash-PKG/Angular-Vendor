import { VendorLoginComponent } from './vendor-login/vendor-login.component';
import { NonPoInvoiceDumpComponent } from './non-po-invoice-dump/non-po-invoice-dump.component';
import { PoInvoiceDumpComponent } from './po-invoice-dump/po-invoice-dump.component';
import { VendorRegistrationComponent } from './vendor-registration/vendor-registration.component';
import { VendorApprovalComponent } from './vendor-approval/vendor-approval.component';
import { VendorDocumentsComponent } from './vendor-documents/vendor-documents.component';
import { VendorBankDetailsComponent } from './vendor-bank-details/vendor-bank-details.component';
import { VendorAddressComponent } from './vendor-address/vendor-address.component';
import { VendorDetailsComponent } from './vendor-details/vendor-details.component';
import { PoDetailsComponent } from './po-details/po-details.component';
import { PendingApprovalsComponent } from './pending-approvals/pending-approvals.component';
import { InvoiceUploadComponent } from './invoice-upload/invoice-upload.component';
import { InvoiceSearchComponent } from './invoice-search/invoice-search.component';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { InvoiceApprovalsComponent } from './invoice-approvals/invoice-approvals.component';
import { EmpanelmentComponent } from './empanelment/empanelment.component';
import { PoSearchComponent } from './po-search/po-search.component';
import { CanExitGuard } from './common/can-exit-guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuardLogin } from './login/authguard.login';
import { HomeComponent } from './home/home.component';
import { VendorDashboardComponent } from './vendor-dashboard/vendor-dashboard.component';
import { LoginVendorComponent } from './login-vendor/login-vendor.component';
import { VendorDumpComponent } from './vendor-dump/vendor-dump.component';
import { AuthenticationGuard } from 'microsoft-adal-angular6';

const routes: Routes = [
    {
        path: 'id_token',
        component: LoginComponent,
        //canActivate: [AuthenticationGuard]
    },
    {
        path: 'login',
        component: LoginComponent,
        //canActivate: [AuthenticationGuard]
    },
    {
        path: 'vendorlogin',
        component: VendorLoginComponent
    },
    {
        path: 'vendortemplogin',
        component: LoginVendorComponent
    },
    {
        path: 'home',
        component: HomeComponent,
        children: [
            {
                path: 'posearch',
                component: PoSearchComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: 'invapproval',
                component: InvoiceApprovalsComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: 'invdetails',
                component: InvoiceDetailsComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: 'invsearch',
                component: InvoiceSearchComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: 'invupload',
                component: InvoiceUploadComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: 'pendingapprovals',
                component: PendingApprovalsComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: 'podetails',
                component: PoDetailsComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: 'vendashboard',
                component: VendorDashboardComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: 'poinvoicedump',
                component: PoInvoiceDumpComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: 'nonpoinvoicedump',
                component: NonPoInvoiceDumpComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: 'vendordump',
                component: VendorDumpComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: 'venapproval',
                component: VendorApprovalComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: 'empanelment',
                component: EmpanelmentComponent,
                canActivate: [AuthGuardLogin]
            },
        ]
    },
    {
        path: 'vendor',
        component: VendorRegistrationComponent,
        children: [
            {
                path: 'vendetails',
                component: VendorDetailsComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: 'venaddr',
                component: VendorAddressComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: 'venbank',
                component: VendorBankDetailsComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: 'vendocs',
                component: VendorDocumentsComponent,
                canActivate: [AuthGuardLogin]
            },
            {
                path: '',
                redirectTo: 'vendetails',
                pathMatch: 'full'
            }
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
