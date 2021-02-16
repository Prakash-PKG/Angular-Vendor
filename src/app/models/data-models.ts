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
export class BankAccountTypeModel {
    bankAccountTypeId: number;
    accountTypeCode: string;
    accountTypeName: string;
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
    companyCodes: string[];
    countryCodes: string[];
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
    plantsList: PlantModel[];
    regionsList: regionMasterVOList[];
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
    projectId: string = null;
    projectName: string = null;
    plantCode: string = null;
    plantDescription = null;
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
    contactNum: string;
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
    isSez: boolean = false;
    isRcmApplicable: boolean = false;
    lutNum: string;
    lutDate: string;
    paymentTerms: string;
    cinNum: string;
    isMsmedRegistered: boolean = false;
    pfNum: string;
    esiNum: string;
    hasTdsLower: boolean = false;
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
    vendorId: string;
    bankAccountTypeId: string;
    statusCode: string;
    groupCodeDesc: string;
    companyCodeDesc: string;
    currencyCodeDesc: string;
    withHoldTypeCode: string;
    withholdTaxCode: string;
    fileDetails: FileDetailsModel[];
}

export interface FileMap {
    [key: number]: {
        filesList: FileDetailsModel[],
        isMandatory: boolean,
        isAttached: boolean,
        isError: boolean,
        toAttach: FileDetailsModel[],
        isAttachWithoutValue: boolean
    }
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
    bankAccountTypeList: BankAccountTypeModel[];
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
    accountAssignmenCategory: string;
    documentType: string;
    paymentStatus: string;
    tcsAmount: string;
    plantCode: string;
    plantDescription: string;
    // invoiceUploadedBy:string;
}

export class InvoiceSearchRequestModel {
    vendorId: string;
    employeeId: string;
    approvalLevels: string[];
    departments: string[];
    isForPayments: boolean;
    projectIds: string[];
}

export class InvoiceDetailsRequestModel {
    purchaseOrderId: number;
    invoiceId: number;
    poNumber: string;
    invoiceNumber: string;
    vendorId: string;
    isForPayment: boolean;
}

export class InvoiceDetailsResultModel {
    statusDetails: StatusModel;
    itemsList: ItemDisplayModel[];
    invoiceFilesList: FileDetailsModel[];
    supportFilesList: FileDetailsModel[];
    rectifiedFilesList: FileDetailsModel[];
    approvalsList: InvoiceApprovalModel[];
    paymentStatusDetails: PaymentStatusDetailsModel;
    paymentStatusList: paymentStatusModel[];
    paymentDetails: PaymentDetailsModel;
    delMgrDetails: EmployeeDetailsModel;
}

export class EmployeeDetailsModel {
    department: string;
    designation: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    manager: boolean;
    managerId: string;
    mgrEmailId: string;
    mgrFName: string;
    mgrLName: string;
    mgrMName: string;
    middleName: string;
    offEmailId: string;
    status: string;
}

export class paymentStatusModel {
    paymentStatusId: number;
    statusCode: string;
    statusDesc: string;
}

export class PaymentDetailsModel {
    paymentDetailsId: number;
    purchaseOrderId: number;
    poNumber: string;
    invoiceId: number;
    invoiceNumber: string;
    amountPaid: string;
    statusCode: string;
    statusDesc: string;
    remarks: string;
    createdDate: string;
    createdBy: string;
    updatedDate: string;
}

export class PaymentReqModel extends PaymentDetailsModel {
    updatedBy: string;
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
    tdsAmt: string;
}

export class ApprovalLevelsModel {
    levelName: string;
    status: string;
    date: string;
    remarks: string;
    approverName: string;
}

export class PendingApprovalResultModel {
    statusDetails: StatusModel;
    pendingApprovals: PendingApprovalsModel[];
}

export class PendingApprovalRequestModel {
    employeeId: string;
    approvalLevels: string[];
    departments: string[];
    projectIds: string[];
    isSubContractReceiver: boolean;
}

export class POSearchReqModel extends PendingApprovalRequestModel {
    vendorId: string;
}

export class InvoiceFinanceDumpReqModel {
    startDate: string;
    endDate: string;
    countryCode: string;
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
    projectId: string;
    grnSesNumber: string;
    documentType: string;
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
    countriesList: CountryDataModel[];
    regionMasterVOList: regionMasterVOList[];
    bankAccountTypeList: BankAccountTypeModel[];
}

export class VendorApprovalInitReqModel {
    vendorMasterId: number;
    departmentCode: string;
    approvalId: number;
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

export class PlantModel {
    plantCode: string;
    plantDescription: string;
    plantMasterId: number;
}

export class CompanyCodeMasterList {
    companyCode: string;
    companyDesc: string;
    countryCode: string;
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
    submittedUnits: string;
    invoiceUnits: string;
    unitPrice: string;
    totalAmt: string;
    hsn: string;
    fromDate: string;
    toDate: string;
    remarks: string;
    personnelNumber: string;
    createdBy: string;
    createdDate: string;
}

export class ItemDisplayModel extends ItemModel {
    unitsTotalAmount: number;
    invoiceNumber: string;
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
    regionCode: string;
    regionDescription: string;
    rate: string;
    nonTaxableAmt: string;
    taxableAmt: string;
    totalTax: string;
    currencyType: string;
    projectId: string;
    projectName: string;
    companyCode: string;
    companyName: string;
    plantCode: string;
    plantDescription: string;
    createdBy: string;
    createdDate: string;
    tcsAmount: string;
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

export class CommunicationMsgReqModel {
    invoiceCommunicationId: number;
    purchaseOrderId: number;
    invoiceId: number;
    userId: string;
    message: string;
    createdDate: string;
    createdBy: string;
}

export class CommunicationMsgModel extends CommunicationMsgReqModel {
    firstName: string;
    middleName: string;
    lastName: string;
    updatedDate: string;
    updatedBy: string;
}

export class InvoiceCommunicationDisplayModel {
    purchaseOrderId: number;
    invoiceId: number;
    msgsList: CommunicationMsgModel[] = [];
}

export class InvoiceApprovalInitResultModel {
    invoiceDetails: InvoiceDetailsModel;
    itemsList: ItemDisplayModel[];
    approvalDetails: InvoiceApprovalModel;
    poDetails: PODetailsModel;
    grnSesList: GrnSesModel[];
    invoiceFilesList: FileDetailsModel[] = [];
    supportFilesList: FileDetailsModel[] = [];
    rectifiedFilesList: FileDetailsModel[] = [];
    grnSesItemsList: GrnSesItemModel[];
    approvalsList: InvoiceApprovalModel[];
    communicationMsgsList: CommunicationMsgModel[];
    invoiceFileTypes: InvoiceFileTypwModel[];
    msme: string;
}

export class GrnSesModel {
    grnSesNumber: string;
}

export class GrnSesItemModel extends GrnSesModel {
    itemNo: string;
    grnSesUnits: string;
}

export class GrnSesDisplayModel {
    grnSesNumber: string;
    itemsList: GrnSesItemsDisplayModel[];
}

export class GrnSesItemsDisplayModel {
    grnSesNumber: string;
    itemNo: string;
    grnSesUnits: string;
}

export class InvoiceApprovalModel {
    invoiceApprovalId: number;
    purchaseOrderId: number;
    invoiceId: number;
    departmentId: string;
    projectId: string;
    statusCode: string;
    approverId: string;
    approvalLevel: string;
    remarks: string;
    uploaderRemarks: string;
    approvedDate: string;
    onholdDate: string;
    rectifiedDate: string;
    createdBy: string;
    createdDate: string;
    updatedBy: string;
    updatedDate: string;
    approverName: string;
    invoiceUploadedBy: string;
}

export class UpdateInvoiceApprovalReqModel {
    action: string;
    isOnHold: boolean;
    grnSesNumber: string;
    departmentHeadId: string;
    approvalDetails: InvoiceApprovalModel;
    itemsList: ItemDisplayModel[];
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
    employeeId: string;
}
export class EmpanelmentOtpReqModel {
    userName: string;
}

export class ResetPasswordData {
    userName: string;
    password: string;
    oTP: string;
}

export class VoucherReqModel {
    invoiceId: number;
}

export class VendorReportReqModel {
    vendorIdList: string[];
}

export class InvoiceSLAReportDetailsModel {
    slNo: number;
    vendorId: string;
    vendorName: string;
    invoiceNumber: string;
    invoiceDate: string;
    invoiceSubmittedDate: string;
    invoiceTotalAmt: string;
    invFreightCharges: string;
    invTotalTax: string;
    invoiceGrossAmt: string;
    poNumber: string;
    projectId: string;
    receiverName: string;
    receivedDate: string;
    invGrnSesNumber: string;
    invGrnSesCreatedDate: string;
    dmName: string;
    dmApprovedDate: string;
    finApproverName: string;
    finApprovedDate: string;
    postedToSAPDocNumber: string;
    postedSAPDate: string;
    companyCode: string;
    invStatus: string;
    msme: string;
    currency: string;

}

export class InvoiceSLAReportReqModel {
    startDate: string;
    endDate:string;
}

export class InvoicePostingReportDetailsModel {
    slNo: number;
    invEnteredDate: string;
    vendorId: string;
    vendorName: string;
    invoiceNumber: string;
    invoiceDate: string;
    invoiceTotalAmt: string;
    invTotalTax: string;
    invFreightCharges: string;
    invoiceGrossAmt: string;
    tdsAmount: string;
    netAmount: string;
    hsn: string;
    poNumber: string;
    purchasingGroup: string;
    projectId: string;
    projectDescription: string;
    productLineDesc: string;
    isBillable: string;
    finApprovedDate: string;
    postedSAPDate: string;
    payment: string;
    paidDate: string;
    paymentStatus: string;
    ageing: string;
    companyCode: string;
    msme:string;
    currency:string;
    postedToSAPDocNumber:string;
    plantId:string;
}

export class invoicePostingReportReqModel {
    startDate: string;
    endDate:string;
}
export class vendorMasterReportDetailsModel {
    vendorMasterId: number;
    vendorName: string;
    emailId: string;
    password: string;
    contactPerson: string;
    contactNum: string;
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
    isSez: boolean = false;
    isRcmApplicable: boolean = false;
    lutNum: string;
    lutDate: string;
    paymentTerms: string;
    cinNum: string;
    isMsmedRegistered: String;
    pfNum: string;
    esiNum: string;
    hasTdsLower: boolean = false;
    createdBy: string;
    // createdDate: string;
    updatedBy: string;
    // updatedDate: string;
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
    vendorId: string;
    bankAccountTypeId: string;
    statusCode: string;
    groupCodeDesc: string;
    companyCodeDesc: string;
    currencyCodeDesc: string;
    withHoldTypeCode: string;
    withholdTaxCode: string;
    // fileDetails: FileDetailsModel[];
}
export class fileDetailsVendorDocumentModel{
    fileDetails:FileDetailsModel[];
    vendorMasterDocumentVOList:VendorMasterDocumentModel[];
}