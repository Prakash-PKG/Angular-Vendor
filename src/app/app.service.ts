import { VendorMasterDetailsModel, VendorRegistrationInitDataModel, PendingApprovalsModel } from './models/data-models';

import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AppService {

<<<<<<< HEAD
   readonly domain = "http://localhost:8080";
    // readonly domain = "https://mvendor-dev.marlabs.com";  
=======
    //readonly domain = "http://localhost:8080";
    readonly domain = "https://mvendor-dev.marlabs.com";  
>>>>>>> 1b5c4d502a5c54bc2b7369e624088c5c05d2b394
    //readonly domain = "https://mtime.marlabs.com";  
    readonly baseUrl = this.domain + "/mvendor/";
    readonly customerAuthUrl = this.domain + "/customerAuth/oauth/token";
    readonly isForProduction: boolean = false;

    constructor(private _datePipe: DatePipe) { }

    readonly routingConstants: any = {
        login: "/",
        posearch: "/home/posearch",
        forgotPassword: "/home/fp",
        invoiceApproval: "/home/invapproval",
        invoiceDetails: "/home/invdetails",
        invoiceSearch:"/home/invsearch",
        invUpload: "/home/invupload",
        pendingApprovals: "/home/pendingapprovals",
        poDetails: "/home/podetails",
        vendorApproval: "/home/venapproval",
        empanelment: "/home/empanelment",
        vendorDetails: "/home/vendor/vendetails",
        vendorAddressDetails: "/home/vendor/venaddr",
        vendorBankDetails: "/home/vendor/venbank",
        vendorDocuments: "/home/vendor/vendocs",
        vendorOther: "/home/vendor/venothers"
    };

    readonly pageConstants: any = {
        login: "Login"
    };

    readonly updateOperations: any = {
        save: "save",
        submit: "submit",
        approve: "approve",
        reject: "reject"
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
    
    getFormattedDate(dtStr: string) {
        if(dtStr) {
            return this._datePipe.transform(new Date(dtStr), this.displayDtFormat);
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
        stateName: null,
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
        isSez: false,
        isRcmApplicable: false,
        lutNum: null,
        lut_date: null,
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
        bankCountry: null
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
            stateName: null,
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
            isSez: false,
            isRcmApplicable: false,
            lutNum: null,
            lut_date: null,
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
            bankCountry: null
        };

        return regDetails;
    }

    selectedPendingApprovalRecord: PendingApprovalsModel = null;

    vendorRegistrationInitDetails: VendorRegistrationInitDataModel = null;

    readonly messages: any = {
        vendorRegistrationSaveFailure: "Due to technical problems not able to proceed further. Please try later.",
        vendorRegistrationSubmitSuccessMsg: "Vendor details submitted successful",
        vendorApprovalFailure: "Vendor approval is failed"
    };

}
