

export class BusyDataModel {
    isBusy: boolean;
    msg: string;
}

export class PageDetailsModel {
    pageName: string;
}

export class CountryDataModel {
    CountryCode: string;
    CountryName: string;
}

export class EmpanelmentInitDataModel {
    countryDataVOList: CountryDataModel[];
}

export class EmpanelmentSubmitReqModel {
    emailId: string;
    sentBy: string;
}

export class EmpanelmentSubmitResultModel {
    status: StatusModel;
}

export class InvoiceUploadReqModel {
    vendorId: string;
    approvalLevels: string[];
    departments: string[];
}

export class InvoiceUploadResultModel {
    pODetailsVO: PODetailsModel[];
    statusVO: StatusModel;
}

export class PODetailsModel {
    poNumber: string;
    currencyType: string;
    departmentId: string;
    vendorId: string;
}

export class StatusModel {
    status: number;
    isSuccess: boolean;
    message: string;
    exceptionMsg: string;
}

export class POSearchReqModel {
    employeeId: string;
    approvalLevels: string[];
    departments: string[];
}

export class POSearchResultModel {
    pODetailsVO: PODetailsModel[];
    statusVO: StatusModel;
}

export class VendorMasterDetailsModel {
    vendorName: string;
    emailId: string;
    contactPerson: string;
    contactNum: string;
    buildingNum: string;
    buildingName: string;
    floorNum: string;
    street: string;
    city: string;
    stateName: string;
    countryCode: string;
    pincode: string;
    bankAddress: string;
    accountNum: string;
    accountType: string;
    accountName: string;
    ifscCode: string;
    swiftIbanCode: string;
    routingBank: string;
    swiftInterm: string;
    panNum: string;
    gstNum: string;
    isSez: boolean;
    isRcmApplicable: boolean;
    lutNum: string;
    lut_date: string;
    paymentTerms: string;
    cinNum: string;
    isMsmedRegistered: boolean;
    pfNum: string;
    esiNum: string;
    hasTdsLower: boolean;
    createdBy: string;
    updatedBy: string;
}

export class VendorMasterDocumentModel {
    vendorMasterDocumentsId: number;
    documentDescription: string;
    isMandatory: string;
}

export class VendorRegistrationInitDataModel {
    countryDetails: CountryDataModel[];
    vendorMasterDocumentDetails: VendorMasterDocumentModel[];
}

export class InvoiceSearchResultModel {
    statusDetails: StatusModel;
    invoiceList: InvoiceSearchModel[];
}

export class InvoiceSearchModel {
    rowNumber: number;
    poNumber: string;
    vendorId: string;
    vendorName: string;
    invoiceNumber: string;
    invoiceDate: string;
    invTotalAmt: string;
    departmentId: string;
    approverId: string;
    approvalLevel: string;
    statusCode: string;
    statusDescription: string;
    submittedDate: string;
  
}

export class InvoiceSearchRequestModel {
    employeeId: string;
    approvalLevels: string[];
    departments: string[];
}

export class PendingApprovalResultModel {
    statusDetails: StatusModel;
    pendingApprovals: PendingApprovalsModel[];
}

export class PendingApprovalRequestModel {
    employeeId: string;
    approvalLevels: string[];
    departments: string[];
}

export class PendingApprovalsModel {
    purchaseOrderId: number;
    invoiceId: number;
    poNumber: string;
    invoiceNumber: string;
    vendorId: string;
    vendorName: string;
    departmentId: string;
    approverId: string;
    approvalLevel: string;
    statusCode: string;
    submittedDate: string;
}

