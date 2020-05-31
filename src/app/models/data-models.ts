

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
    countryDetails: CountryDataModel[];
}

export class EmpanelmentSubmitReqModel {
    emailId: string;
    sentBy: string;
}

export class InvoiceUploadReqModel {
    vendorId: string;
}

export class InvoiceUploadResultModel {
    PODetails: PODetailsModel[];
    StatusDetails: StatusvOModel;
}

export class PODetailsModel {
    poNumber: string;
    currencyType: string;
    departmentId: string;
    vendorId: string;
}

export class StatusvOModel {
  
}

export class POSearchReqModel {
    employeeId: string;
}

export class POSearchResultModel {
    PODetails: PODetailsModel[];
    StatusDetails: StatusvOModel;
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