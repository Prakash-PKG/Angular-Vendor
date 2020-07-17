import {
    VendorMasterDetailsModel, VendorRegistrationInitDataModel,
    PendingApprovalsModel, FileDetailsModel, PODetailsModel, InvoiceModel
} from './models/data-models';

import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AppService {

    // readonly domain = "http://localhost:8080";
    readonly domain = "https://mvendor-dev.marlabs.com";
    //readonly domain = "https://mtime.marlabs.com";  
    readonly baseUrl = this.domain + "/mvendor/";
    readonly customerAuthUrl = this.domain + "/customerAuth/oauth/token";
    readonly isForProduction: boolean = false;

    constructor(private _datePipe: DatePipe, private _http: HttpClient) { }

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
        loginVendor: "/loginvendor"
    };

    readonly pageConstants: any = {
        login: "Login"
    };

    readonly updateOperations: any = {
        save: "save",
        submit: "submit",
        approve: "approve",
        reject: "reject",
        sendBack: "sendBack"
    };

    readonly statusNames: any = {
        new: "In Progress",
        approved: "Approved",
        rejected: "Rejected"
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
        procurement: "procurement"
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
    isexistingVendor: boolean = false;

    isInvoiceSearchForPayments: boolean = false;
    isInvoiceDetailsForPayments: boolean = false;

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

    vendorRegistrationDetails: VendorMasterDetailsModel = {
        vendorMasterId: null,
        vendorName: null,
        emailId: null,
        password: null,
        contactPerson: null,
        // contactNum: null,
        buildingNum: null,
        buildingName: null,
        floorNum: null,
        street: null,
        city: null,
        stateCode: null,
        countryCode: null,
        countryName: null,
        pincode: null,
        // bankAddress: null,
        accountNum: null,
        accountType: null,
        accountName: null,
        ifscCode: null,
        swiftIbanCode: null,
        routingBank: null,
        swiftInterm: null,
        panNum: null,
        gstNum: null,
        isSez: null,
        isRcmApplicable: null,
        lutNum: null,
        lutDate: null,
        // paymentTerms: null,
        cinNum: null,
        isMsmedRegistered: null,
        pfNum: null,
        esiNum: null,
        hasTdsLower: null,
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
        otherDocDesc: null
    };

    resetVendorRegistrationDetails() {
        let regDetails: VendorMasterDetailsModel = {
            vendorMasterId: null,
            vendorName: null,
            emailId: null,
            password: null,
            contactPerson: null,
            // contactNum: null,
            buildingNum: null,
            buildingName: null,
            floorNum: null,
            street: null,
            city: null,
            stateCode: null,
            countryCode: null,
            countryName: null,
            pincode: null,
            // bankAddress: null,
            accountNum: null,
            accountType: null,
            accountName: null,
            ifscCode: null,
            swiftIbanCode: null,
            routingBank: null,
            swiftInterm: null,
            panNum: null,
            gstNum: null,
            isSez: null,
            isRcmApplicable: null,
            lutNum: null,
            lutDate: null,
            // paymentTerms: null,
            cinNum: null,
            isMsmedRegistered: null,
            pfNum: null,
            esiNum: null,
            hasTdsLower: null,
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
            otherDocDesc: null
        };

        return regDetails;
    }

    selectedPendingApprovalRecord: PendingApprovalsModel = null;

    vendorRegistrationInitDetails: VendorRegistrationInitDataModel = null;

    readonly messages: any = {
        vendorRegistrationSaveFailure: "Due to technical problems not able to proceed further. Please try later.",
        vendorRegistrationSubmitSuccessMsg: "Vendor details submitted successfully",
        vendorApprovalSubmitSuccessMsg: "Vendor details approved successfully",
        vendorApprovalFailure: "Vendor approval is failed",
        vendorSendBackSuccess: "Vendor Details are send back for correction",
        vendorSendBackFailure: "Vendor details sent back for correction failed",
        vendorRegistrationFormInvalid: "Your Form Contains Error. Please Check",
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

}
