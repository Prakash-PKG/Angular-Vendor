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
    MAT_NATIVE_DATE_FORMATS
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
        InvoiceUploadComponent
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
        NativeDateModule
    ],
     entryComponents: [
        ConfirmDialogComponent,
        MessageDialogComponent
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: HTTP_INTERCEPTORS, useClass: XsrfInterceptor, multi: true },
        { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
        DatePipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
