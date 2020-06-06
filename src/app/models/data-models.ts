export class BusyDataModel {
    isBusy: boolean;
    msg: string;
}

export class PageDetailsModel {
    pageName: string;
}

export class CountryDataModel {
    countryCode: string;
    countryName: string;
}
export class regionMasterVOList {
    regionCode: string;
    regionDesc: string;
    countryCode: string;
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
    poList: PODetailsModel[];
    statusDetails: StatusModel;
}

export class PODetailsModel {
    poNumber: string;
    purchaseOrderId: number;
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

export class VendorRegistrationRequestModel {
    action: string;
    vendorMasterDetails: VendorMasterDetailsModel;
}

export class VendorRegistrationResultModel {
    status: StatusModel;
    vendorMasterDetails: VendorMasterDetailsModel;
}

export class VendorMasterDetailsModel {
    vendorMasterId: number;
    vendorName: string;
    emailId: string;
    password: string;
    contactPerson: string;
    // contactNum: string;
    buildingNum: string;
    buildingName: string;
    floorNum: string;
    street: string;
    city: string;
    stateCode: string;
    stateName: string;
    countryCode: string;
    countryName: string;
    pincode: string;
    // bankAddress: string;
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
    lutDate: string;
    // paymentTerms: string;
    cinNum: string;
    isMsmedRegistered: boolean;
    pfNum: string;
    esiNum: string;
    hasTdsLower: boolean;
    createdBy: string;
    createdDate: string;
    updatedBy: string;
    updatedDate: string;
    mobileNum: string;
    telephoneNum: string;
    bankName: string;
    bankBranch: string;
    bankCity: string;
    bankRegion: string;
    bankCountry: string;
    address1: string;
    address2: string;
    bankRegionName: string;
    bankCountryName: string;
    groupCode: string;
    companyCode: string;
    currencyCode: string;
    procRemark: string;
    finRemark: string;

}

export class VendorMasterDocumentModel {
    vendorMasterDocumentsId: number;
    documentDescription: string;
    isMandatory: string;
}

export class VendorRegistrationInitDataModel {
    countriesList: CountryDataModel[];
    documentDetailsList: VendorMasterDocumentModel[];
    regionMasterVOList: regionMasterVOList[];
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
    approveType: string;
    vendorMasterId: number;
}

export class VendorMasterFilesModel {
    vendorMasterFilesId: number;
    vendorMasterId: number;
    vendorMasterDocumentsId: number;
    actualFileName: string;
    uniqFileName: string;
    documentDescription: string;
}

export class VendorApprovalInitResultModel {
    statusDetails: StatusModel;
    filesList: VendorMasterFilesModel[];
    vendorMasterDetails: VendorMasterDetailsModel;
    accGroupMasterList: AccGroupMasterList[];
    companyCodeMasterList: CompanyCodeMasterList[];
    currencyMasterList: currencyMasterList[];
    vendorApprovalDetails: vendorApprovalDetails;
}

export class VendorApprovalInitReqModel {
    vendorMasterId: number;
    departmentCode: string;
}

export class vendorApprovalDetails {
    vendorApprovalID: number;
    vendorMasterId: number;
    departmentCode: string;
    approverId: string;
    remarks: string;
    groupCode: string;
    companyCode: string;
    currencyCode: string;
    createdBy: string;
    createDate: string;
}

export class VendorApprovalReqModel extends vendorApprovalDetails {
    action: string;
}

export class CompanyCodeMasterList {
    companyCode: string;
    companyDesc: string;
}
export class AccGroupMasterList {
    groupCode: string;
    groupDesc: string;

}
export class currencyMasterList {
    currencyCode: string;
    currencyDesc: string;
}

export class POItemsRequestModel {
    poNumber: string;
}

export class POItemsResultModel {
    statusDetails: StatusModel;
    itemsList: ItemModel[];
}

export class ItemModel {
    poNumber: string;
    itemNumber: string;
    itemId: number;
    itemDescription: string;
    orderedUnits: string;
    suppliedUnits: string;
    consumedUnits: string;
    invoiceUnits: string;
    unitPrice: string;
    hsn: string;
    createdBy: string;
    createdDate: string;
}

export class InvoiceDetailsModel {
    invoiceId: number;
    purchaseOrderId: number;
    invoiceNumber: string;
    invoiceDate: string;
    remarks: string;
    freightCharges: string;
    totalAmt: string;
    grnSesNumber: string;
    statusCode: string;
    totalTax: string;
    createdBy: string;
    createdDate: string;
}

export class UpdateInvoiceRequestModel {
    action: string;
    vendorEmailId: string;
    poDetails: PODetailsModel;
    invoiceDetails: InvoiceDetailsModel;
    itemsDetails: ItemModel[];
}

export class UpdateInvoiceResultModel {
    statusDetails: StatusModel;
    invoiceDetails: InvoiceDetailsModel;
    itemsDetails: ItemModel[];
}

export class InvoiceApprovalInitReqModel {
    purchaseOrderId: number;
	invoiceId: number;
	poNumber: string;
	poDeptId: string;
	approvalLevel: string;
}

export class InvoiceApprovalInitResultModel {
    invoiceDetails: InvoiceDetailsModel;
    itemsList: ItemModel[];
    approvalDetails: InvoiceApprovalModel;
}

export class InvoiceApprovalModel {
    invoiceApprovalId: number;
    purchaseOrderId: number;
    invoiceId: number;
    departmentId: string;
    statusCode: string;
    approverId: string;
    approvalLevel: string;
    remarks: string;
}

export class UpdateInvoiceApprovalReqModel {
    action: string;
    departmentHeadId: string;
    approvalDetails: InvoiceApprovalModel;
}

export class FileDetailsModel {
    actualFileName: String;
    uniqueFileName: string;
    fileData: any;
    documentTypeId: number;
    fileId: number;
}

export class InvoiceDocumentReqModel {
    invoiceId: number;
    fileDetails: FileDetailsModel[];
}