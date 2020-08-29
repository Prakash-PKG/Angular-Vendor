import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BsDatepickerModule, PaginationModule, AlertModule, BsDropdownModule, ModalModule, PopoverModule, TypeaheadModule } from 'ngx-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocationStrategy, HashLocationStrategy, PathLocationStrategy } from '@angular/common';
import { DatePipe } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BsModalRef } from 'ngx-bootstrap';
import { XsrfInterceptor } from './common/xsrf-interceptor.service';
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatStepperModule,
    NativeDateModule,
    MAT_DATE_FORMATS,
    MAT_NATIVE_DATE_FORMATS,
    MAT_SNACK_BAR_DEFAULT_OPTIONS
} from '@angular/material';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { PoSearchComponent } from './po-search/po-search.component';
import { InvoiceSearchComponent } from './invoice-search/invoice-search.component';
import { EmpanelmentComponent } from './empanelment/empanelment.component';
import { PendingApprovalsComponent } from './pending-approvals/pending-approvals.component';
import { PoDetailsComponent } from './po-details/po-details.component';
import { InvoiceApprovalsComponent } from './invoice-approvals/invoice-approvals.component';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { VendorDetailsComponent } from './vendor-details/vendor-details.component';
import { VendorAddressComponent } from './vendor-address/vendor-address.component';
import { VendorBankDetailsComponent } from './vendor-bank-details/vendor-bank-details.component';
import { VendorDocumentsComponent } from './vendor-documents/vendor-documents.component';
import { VendorRegistrationComponent } from './vendor-registration/vendor-registration.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VendorApprovalComponent } from './vendor-approval/vendor-approval.component';
import { InvoiceUploadComponent } from './invoice-upload/invoice-upload.component';
import { VendorOthersComponent } from './vendor-others/vendor-others.component';
import { PoInvoiceDumpComponent } from './po-invoice-dump/po-invoice-dump.component';
import { NonPoInvoiceDumpComponent } from './non-po-invoice-dump/non-po-invoice-dump.component';
import { VendorDashboardComponent } from './vendor-dashboard/vendor-dashboard.component';
import { LoginVendorComponent } from './login-vendor/login-vendor.component';
import { VendorDumpComponent } from './vendor-dump/vendor-dump.component';
import { VendorLoginComponent } from './vendor-login/vendor-login.component';
import { MsAdalAngular6Module, AuthenticationGuard } from 'microsoft-adal-angular6';
import { GrnSesItemsComponent } from './grn-ses-items/grn-ses-items.component';
import { UserIdleModule } from 'angular-user-idle';
import { ContactComponent } from './contact/contact.component';
import { InvoiceCommunicationDialogComponent } from './invoice-communication-dialog/invoice-communication-dialog.component';

import { BotDetectCaptchaModule } from 'angular-captcha';
import { AppCaptchaComponent } from './app-captcha/app-captcha.component';
import { SessionTimeoutDialogComponent } from './session-timeout-dialog/session-timeout-dialog.component';
import { globalConstant } from './common/global-constant';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        HomeComponent,
        HeaderComponent,
        SidebarComponent,
        ConfirmDialogComponent,
        MessageDialogComponent,
        PoSearchComponent,
        InvoiceSearchComponent,
        EmpanelmentComponent,
        PendingApprovalsComponent,
        PoDetailsComponent,
        InvoiceApprovalsComponent,
        InvoiceDetailsComponent,
        VendorDetailsComponent,
        VendorAddressComponent,
        VendorBankDetailsComponent,
        VendorDocumentsComponent,
        VendorRegistrationComponent,
        ForgotPasswordComponent,
        VendorApprovalComponent,
        InvoiceUploadComponent,
        VendorOthersComponent,
        PoInvoiceDumpComponent,
        NonPoInvoiceDumpComponent,
        VendorDashboardComponent,
        LoginVendorComponent,
        VendorDumpComponent,
        VendorLoginComponent,
        GrnSesItemsComponent,
        ContactComponent,
        InvoiceCommunicationDialogComponent,
        AppCaptchaComponent,
        SessionTimeoutDialogComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        HttpModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        BsDatepickerModule.forRoot(),
        PaginationModule.forRoot(),
        AlertModule.forRoot(),
        BsDropdownModule.forRoot(),
        ModalModule.forRoot(),
        PopoverModule.forRoot(),
        NgxSpinnerModule,
        TypeaheadModule.forRoot(),
        MatAutocompleteModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatStepperModule,
        MatDatepickerModule,
        MatDialogModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        NativeDateModule,
        BotDetectCaptchaModule.forRoot({
            captchaEndpoint: 'https://mvendor-dev.marlabs.com/mvendor/simple-captcha-endpoint'
        }),
        MsAdalAngular6Module.forRoot(getDevAdalConfig),
        // Optionally you can set time for `idle`, `timeout` and `ping` in seconds.
        // Default values: `idle` is 600 (10 minutes), `timeout` is 300 (5 minutes) 
        // and `ping` is 120 (2 minutes).
        //UserIdleModule.forRoot({idle: 600, timeout: 300, ping: 120})
        //UserIdleModule.forRoot({idle: 10, timeout: 5, ping: 5})
        //UserIdleModule.forRoot({idle: 1200, timeout: 300, ping: 120})
        UserIdleModule.forRoot({ idle: globalConstant.sessionTimeout.idle, timeout: globalConstant.sessionTimeout.timeout, ping: globalConstant.sessionTimeout.ping })
    ],
     entryComponents: [
        ConfirmDialogComponent,
        MessageDialogComponent,
        ForgotPasswordComponent,
        InvoiceCommunicationDialogComponent,
        GrnSesItemsComponent,
        SessionTimeoutDialogComponent
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: HTTP_INTERCEPTORS, useClass: XsrfInterceptor, multi: true },
        { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
        {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}},
        DatePipe,
        AuthenticationGuard
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }


export function getDevAdalConfig() {
    return {
          tenant: 'cc6b2eea-c864-4839-85f5-94736facc3be',
          clientId: '303d1268-502c-4e7d-afaf-584e2dfd6c83',
          //redirectUri: 'http://localhost:4200/#/login',
          redirectUri: 'https://mvendor-dev.marlabs.com/dist/#/login',//window.location.origin,
          // endpoints: { <------------------------------------------- ADD
          //     "https://localhost:/Api/": "36dfe25f-b1a0-412e-a134-c81e12148460",
          //     ---
          //     ---
          // },
          navigateToLoginRequestUrl: true,
          cacheLocation: '<localStorage / sessionStorage>',
          oauth2AllowIdTokenImplicitFlow: true
    };
}

export function getProdAdalConfig() {
    return {
          tenant: 'cc6b2eea-c864-4839-85f5-94736facc3be',
          clientId: 'd07ff15b-e80a-43cd-bd5c-bddbcedd2df7',
          redirectUri: 'https://mvendor.marlabs.com/dist/#/login',
          navigateToLoginRequestUrl: true,
          cacheLocation: '<localStorage / sessionStorage>',
          oauth2AllowIdTokenImplicitFlow: true
    };
}
