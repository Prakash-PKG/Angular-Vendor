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

export class InvoiceFileTypwModel {
    fileType: string;
    invoiceFileTypesId: number;
}

export class InvoiceUploadResultModel {
    poList: PODetailsModel[];
    invoiceFileTypes: InvoiceFileTypwModel[];
    currencyList: currencyMasterList[];
    statusDetails: StatusModel;
    companiesList: CompanyCodeMasterList[];
}

export class PODetailsModel {
    poNumber: string = null;
    purchaseOrderId: number = null;
    vendorId: string = null;
    vendorName: string = null;
    currencyType: string = null;
    departmentId: string = null;
    documentType: string = null;
    accountAssignmenCategory: string;
    poDate: string = null;
    totalAmount: string = null;
    billedAmount: string = null;
    paidAmount: string = null;
    companyCode: string = null;
    companyName: string = null;
    createdBy: string = null;
    createdDate: string = null;
}

export class StatusModel {
    status: number;
    isSuccess: boolean;
    message: string;
    exceptionMsg: string;
}

export class POSearchResultModel {
    poList: PODetailsModel[];
    statusDetails: StatusModel;
}

export class VendorRegistrationRequestModel {
    action: string;
    vendorMasterDetails: VendorMasterDetailsModel;
}
export class VendorRegistrationDetailRequestModel {
    vendorMasterId: number;
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
    procApprByName: string;
    finApprByName: string;
    finRemark: string;
    // isGSTReg: boolean;
    otherDocDesc: string;
}

export class VendorMasterDocumentModel {
    vendorMasterDocumentsId: number;
    documentDescription: string;
    isMandatory: boolean;
}

export class VendorRegistrationInitDataModel {
    countriesList: CountryDataModel[];
    documentDetailsList: VendorMasterDocumentModel[];
    regionMasterVOList: regionMasterVOList[];
}

export class InvoiceSearchResultModel {
    statusDetails: StatusModel;
    invoiceList: InvoiceModel[];
}

export class InvoiceModel {
    purchaseOrderId: number;
    poNumber: string;
    vendorId: string;
    vendorName: string;
    invoiceId: number;
    invoiceNumber: string;
    invoiceDate: string;
    currencyType: string;
    totalAmt: string;
    totalTax: string;
    remarks: string;
    freightCharges: string;
    grnSesNumber: string;
    statusCode: string;
    companyCode: string;
    companyName: string;
    projectId: string;
    projectName: string;
}

export class InvoiceSearchRequestModel {
    vendorId: string;
    employeeId: string;
    approvalLevels: string[];
    departments: string[];
}

export class InvoiceDetailsRequestModel {
    purchaseOrderId: number;
    invoiceId: number;
    poNumber: string;
    invoiceNumber: string;
    vendorId: string;
}

export class InvoiceDetailsResultModel {
    statusDetails: StatusModel;
    itemsList: ItemDisplayModel[];
    invoiceFilesList: FileDetailsModel[];
    supportFilesList: FileDetailsModel[];
    approvalsList: InvoiceApprovalModel[];
    paymentDetails: PaymentStatusDetailsModel;
}

export class PaymentStatusDetailsModel {
    vendorId: string;
    poNumber: string;
    invoiceNumber: string;
    currencyType: string;
    invoiceAmountPaid: string;
    paymentDate: string;
    status: string;
    remarks: string;
}

export class ApprovalLevelsModel {
    levelName: string;
    status: string;
    date: string;
    remarks: string;
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

export class POSearchReqModel extends PendingApprovalRequestModel {
    vendorId: string;
}

export class InvoiceFinanceDumpReqModel {
    startDate: string;
    endDate: string;
    employeeId: string;
    isIncremental: boolean;
}
export class VendorDumpReqModel {
    startDate: string;
    endDate: string;
    employeeId: string;
    isIncremental: boolean;
}

export class InvoiceDumpInitResultModel {
    lastDumpDt: string;
}
export class VendorDumpInitResultModel {
    lastDumpDt: string;
}

export class PendingApprovalsModel {
    approvalId: number;
    purchaseOrderId: number;
    invoiceId: number;
    poNumber: string;
    invoiceNumber: string;
    accountAssignmenCategory: string;
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
    fileDetails: FileDetailsModel[];
    vendorMasterDetails: VendorMasterDetailsModel;
    accGroupMasterList: AccGroupMasterList[];
    companyCodeMasterList: CompanyCodeMasterList[];
    currencyMasterList: currencyMasterList[];
    vendorApprovalDetails: vendorApprovalDetails;
    withholdTypeVOList: WithholdTypeList[];
    withholdTaxVOList: WithholdTaxList[];
    vendorMasterDocumentVOList: VendorMasterDocumentModel[];
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
    withholdTypeCode: string;
    withholdTaxCode: string;
}

export class VendorApprovalReqModel extends vendorApprovalDetails {
    action: string;
    vendorMasterDetails: VendorMasterDetailsModel
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
    currencyMasterId: number;
}

export class POItemsRequestModel {
    poNumber: string;
}

export class POItemsResultModel {
    statusDetails: StatusModel;
    itemsList: ItemModel[];
    notRejectedItemsList: NotRejectedItemsModel[];
}

export class NotRejectedItemsModel {
    itemNumber: string;
    invoicedUnits: string;
}

export class ItemModel {
    poNumber: string;
    itemNumber: string;
    itemId: number;
    itemDescription: string;
    uom: string;
    orderedUnits: string;
    suppliedUnits: string;
    consumedUnits: string;
    invoiceUnits: string;
    unitPrice: string;
    totalAmt: string;
    hsn: string;
    createdBy: string;
    createdDate: string;
}

export class ItemDisplayModel extends ItemModel {
    unitsTotalAmount: number;
}

export class InvoiceDetailsModel {
    invoiceId: number;
    purchaseOrderId: number;
    vendorId: string;
    vendorName: string;
    invoiceNumber: string;
    invoiceDate: string;
    remarks: string;
    freightCharges: string;
    totalAmt: string;
    grnSesNumber: string;
    statusCode: string;
    totalTax: string;
    currencyType: string;
    projectId: string;
    projectName: string;
    companyCode: string;
    companyName: string;
    createdBy: string;
    createdDate: string;
}

export class UpdateInvoiceRequestModel {
    action: string;
    userId: string;
    poDetails: PODetailsModel;
    invoiceDetails: InvoiceDetailsModel;
    itemsDetails: ItemModel[];
    filesList: FileDetailsModel[];
}

export class UpdateInvoiceResultModel {
    statusDetails: StatusModel;
    poDetails: PODetailsModel;
    invoiceDetails: InvoiceDetailsModel;
    itemsDetails: ItemModel[];
}

export class InvoiceApprovalInitReqModel {
    approvalId: number;
    purchaseOrderId: number;
    invoiceId: number;
    poNumber: string;
    poDeptId: string;
    approvalLevel: string;
}

export class InvoiceApprovalInitResultModel {
    invoiceDetails: InvoiceDetailsModel;
    itemsList: ItemDisplayModel[];
    approvalDetails: InvoiceApprovalModel;
    poDetails: PODetailsModel;
    grnSesList: GrnSesModel[];
    invoiceFilesList: FileDetailsModel[];
    supportFilesList: FileDetailsModel[];
}

export class GrnSesModel {
    grnSesNumber: string;
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
    createdBy: string;
    createdDate: string;
    updatedBy: string;
    updatedDate: string;
}

export class UpdateInvoiceApprovalReqModel {
    action: string;
    grnSesNumber: string;
    departmentHeadId: string;
    approvalDetails: InvoiceApprovalModel;
}

export class FileDetailsModel {
    actualFileName: string;
    uniqueFileName: string;
    fileData: any;
    documentTypeId: number;
    fileId: number;
    createdDate: string;
    createdBy: string;
}

export class InvoiceDocumentReqModel {
    invoiceId: number;
    userId: string;
    fileDetails: FileDetailsModel[];
}

export class InvoiceDocumentResultModel {
    status: StatusModel;
    fileDetails: FileDetailsModel[];
}

export class WithholdTaxList {
    withholdTaxId: number;
    withholdTaxCode: string;
    withholdTaxDesc: string;
    withholdTypeCode: string;
}
export class WithholdTypeList {
    withholdTypeId: number;
    withholdTypeCode: string;
    withholdTypeDesc: string;
    countryCode: string;
}

export class RemoveDocumentReqModel {
    fileId: number;
}

export class VendorDocumentReqModel {
    userId: string;
    fileDetails: FileDetailsModel[];
    vendorMasterId: number;
}

export class VendorDocumentResultModel {
    status: StatusModel;
    fileDetails: FileDetailsModel[];
}

export class PODetailsRequestModel {
    purchaseOrderId: number;
}

export class PODetailsResultsModel {
    statusDetails: StatusModel;
    itemsList: ItemDisplayModel[];
}

export class VendorAutoCompleteModel {
    vendorMasterId: number;
    vendorId: string;
    vendorName: string;
}

export class InvoiceExistReqModel {
    vendorId: string;
    innvoiceNumber: string;
}

export class ProjectAutoCompleteModel {
    projectId: string;
    projectName: string;
}

export class ForgotPasswordData {
    email: string;
}
export class EmpanelmentOtpReqModel {
    username: string;
}
