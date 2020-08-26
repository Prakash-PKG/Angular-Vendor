import { LoginService } from './login/login.service';
import {
    VendorMasterDetailsModel, VendorRegistrationInitDataModel,
    PendingApprovalsModel, FileDetailsModel, PODetailsModel, InvoiceModel, FileMap
} from './models/data-models';

import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UserIdleService } from 'angular-user-idle';

@Injectable({
    providedIn: 'root'
})
export class AppService {

    // readonly domain = "http://localhost:8080";
    readonly domain = "https://mvendor-dev.marlabs.com"; 
       // readonly domain = "https://mvendor-stg.marlabs.com";     
    readonly baseUrl = this.domain + "/mvendor/";
    readonly customerAuthUrl = this.domain + "/customerAuth/oauth/token";
    readonly isForProduction: boolean = false;
    readonly isSSORequired: boolean = false;

    constructor(private _datePipe: DatePipe,
        private _http: HttpClient,
        private _userIdleService: UserIdleService) { }

    token: string = '';

    readonly routingConstants: any = {
        login: "/",
        posearch: "/home/posearch",
        forgotPassword: "/home/fp",
        invoiceApproval: "/home/invapproval",
        invoiceDetails: "/home/invdetails",
        invoiceSearch: "/home/invsearch",
        invoiceUpload: "/home/invupload",
        pendingApprovals: "/home/pendingapprovals",
        poDetails: "/home/podetails",
        poInvoiceDump: "/home/poinvoicedump",
        nonpoInvoiceDump: "/home/nonpoinvoicedump",
        vendorDump: "/home/vendordump",
        vendorApproval: "/home/venapproval",
        empanelment: "/home/empanelment",
        vendorDetails: "/vendor/vendetails",
        vendorAddressDetails: "/vendor/venaddr",
        vendorBankDetails: "/vendor/venbank",
        vendorDocuments: "/vendor/vendocs",
        vendorOther: "/vendor/venothers",
        vendorDashboard: "/home/vendashboard",
        loginVendor: "/vendorlogin",
        contact: "/home/contact"
    };

    readonly pageConstants: any = {
        login: "Login"
    };

    readonly updateOperations: any = {
        save: "save",
        submit: "submit",
        approve: "approve",
        reject: "reject",
        onhold: 'onhold',
        sendBack: "sendBack",
        rectified: "rectified"
    };

    readonly statusNames: any = {
        new: "In Progress",
        approved: "Approved",
        rejected: "Rejected",
        received: 'Received'
    };

    readonly statusCodes: any = {
        new: "new",
        approved: "approved",
        rejected: "rejected"
    };

    readonly approvalLevels: any = {
        po: "po",
        functionalHead: "functional_head",
        finance: "finance",
        procurement: "procurement",
        subContractReceiver: "subContractReceiver"
    };

    readonly approvalTypes: any = {
        vendor: "vendor",
        invoice: "invoice"
    };

    readonly dbDateFormat: string = "yyyy-MM-dd"; // Server and DB expects this format, by changing this it will reflect in all places
    readonly displayDtFormat: string = "dd MMM yyyy"; // Displays dates in this format. By changing this, total application date formats will change
    readonly displayDateTimeFormat: string = "dd MMM yyyy HH:mm:ss";

    readonly dbDateTimeFormat: string = "yyyy-MM-dd HH:mm:ss";

    selectedPO: PODetailsModel = null;

    selectedInvoice: InvoiceModel = null;

    selectedVendor: VendorMasterDetailsModel = null;

    isInvoiceSearchForPayments: boolean = false;
    isInvoiceDetailsForPayments: boolean = false;

    isExistingVendor: boolean = false;

    getFormattedDate(dtStr: string) {
        if (dtStr) {
            return this._datePipe.transform(new Date(dtStr), this.displayDtFormat);
        }

        return "";
    }

    getFormattedDateTime(dtStr: string) {
        if (dtStr) {
            return this._datePipe.transform(new Date(dtStr), this.dbDateTimeFormat);
        }

        return "";
    }

    getDBFormattedDate(dtStr: string) {
        if (dtStr) {
            return this._datePipe.transform(new Date(dtStr), this.dbDateFormat);
        }

        return "";
    }

    vendorRegistrationDetails: VendorMasterDetailsModel = {
        vendorMasterId: null,
        vendorId: null,
        vendorName: null,
        emailId: null,
        password: null,
        contactPerson: null,
        contactNum: null,
        buildingNum: null,
        buildingName: null,
        floorNum: null,
        street: null,
        city: null,
        stateCode: null,
        countryCode: null,
        countryName: null,
        pincode: null,
        bankAddress: null,
        accountNum: null,
        accountType: null,
        accountName: null,
        ifscCode: null,
        swiftIbanCode: null,
        routingBank: null,
        swiftInterm: null,
        panNum: null,
        gstNum: null,
        isSez: false,
        isRcmApplicable: false,
        lutNum: null,
        lutDate: null,
        paymentTerms: null,
        cinNum: null,
        isMsmedRegistered: false,
        pfNum: null,
        esiNum: null,
        hasTdsLower: false,
        createdBy: null,
        updatedBy: null,
        createdDate: null,
        updatedDate: null,
        mobileNum: null,
        telephoneNum: null,
        bankName: null,
        bankBranch: null,
        bankCity: null,
        bankRegion: null,
        bankCountry: null,
        address1: null,
        address2: null,
        bankRegionName: null,
        bankCountryName: null,
        stateName: null,
        groupCode: null,
        companyCode: null,
        currencyCode: null,
        procRemark: null,
        procApprByName: null,
        finApprByName: null,
        finRemark: null,
        // isGSTReg:null,
        otherDocDesc: null,
        bankAccountTypeId:null,
        statusCode: null,
        groupCodeDesc: null,
        companyCodeDesc: null,
        currencyCodeDesc: null,
        withHoldTypeCode: null,
        withholdTaxCode: null,
        fileDetails: []

    };

    selectedFileMap: FileMap = {};

    resetVendorRegistrationDetails() {
        let regDetails: VendorMasterDetailsModel = {
            vendorMasterId: null,
            vendorName: null,
            emailId: null,
            password: null,
            contactPerson: null,
            contactNum: null,
            buildingNum: null,
            buildingName: null,
            floorNum: null,
            street: null,
            city: null,
            stateCode: null,
            countryCode: null,
            countryName: null,
            pincode: null,
            bankAddress: null,
            accountNum: null,
            accountType: null,
            accountName: null,
            ifscCode: null,
            swiftIbanCode: null,
            routingBank: null,
            swiftInterm: null,
            panNum: null,
            gstNum: null,
            isSez: false,
            isRcmApplicable: false,
            lutNum: null,
            lutDate: null,
            paymentTerms: null,
            cinNum: null,
            isMsmedRegistered: false,
            pfNum: null,
            esiNum: null,
            hasTdsLower: false,
            createdBy: null,
            updatedBy: null,
            createdDate: null,
            updatedDate: null,
            mobileNum: null,
            telephoneNum: null,
            bankName: null,
            bankBranch: null,
            bankCity: null,
            bankRegion: null,
            bankCountry: null,
            address1: null,
            address2: null,
            bankRegionName: null,
            bankCountryName: null,
            stateName: null,
            groupCode: null,
            companyCode: null,
            currencyCode: null,
            procRemark: null,
            procApprByName: null,
            finApprByName: null,
            finRemark: null,
            // isGSTReg:null,
            otherDocDesc: null,
            vendorId: null,
            bankAccountTypeId:null,
            statusCode: null,
            groupCodeDesc: null,
            companyCodeDesc: null,
            currencyCodeDesc: null,
            withHoldTypeCode: null,
            withholdTaxCode: null,
            fileDetails: []
        };

        return regDetails;
    }

    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    selectedPendingApprovalRecord: PendingApprovalsModel = null;

    vendorRegistrationInitDetails: VendorRegistrationInitDataModel = null;

    readonly messages: any = {
        vendorRegistrationSaveFailure: "Due to technical problems not able to proceed further. Please try later.",
        vendorRegistrationSubmitSuccessMsg: "Vendor details submitted successfully",
        vendorApprovalSubmitSuccessMsg: "Vendor details approved successfully",
        vendorApprovalFailure: "Vendor approval/receiving is failed",
        vendorSendBackSuccess: "Vendor Details are send back for correction",
        vendorSendBackFailure: "Vendor details sent back for correction failed",
        vendorRegistrationFormInvalid: "Form Contains Error. Please Check",
        paymentStatusUpdateFailureMsg: "Payment Status update is failed."
    };

    getFileData(fileDetails: FileDetailsModel) {
        let url = this.baseUrl + 'downloadInvDoc/' + fileDetails.uniqueFileName;
        return this._http.get(url, { responseType: 'arraybuffer', observe: 'response' });
    }

    downloadInvoiceFile(fileDetails: FileDetailsModel) {
        this.getFileData(fileDetails).subscribe(
            (data) => {
                const blob = new Blob([data.body], { type: 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = fileDetails.actualFileName;
                document.body.appendChild(a);
                a.click();
            },
            error => {
                console.log(error);
            });
    }

    startWatching() {
        this._userIdleService.startWatching();
    }

    stopWatching() {
        this._userIdleService.stopWatching();
    }

    stopTimer() {
        this._userIdleService.stopTimer();
    }

    restartTimer() {
        this._userIdleService.resetTimer();
    }

}
