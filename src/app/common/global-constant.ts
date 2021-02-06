
export const countryCompanyCodes: any = {
    indiaCompanyCodes: ["7510", "7520"],
    usCompanyCodes: ["7010", "7020"]
};

export const globalConstant : any = {
    poRoles: ["adp", "hrp", "isp", "itp", "lgp", "mkp", 'fip', 'psp', 'cgp', 'ssp', 'isp', 'hr1', 'hr2', 'hr3', 'hr4', 'ism',
                "adp-us"],
    invUploadRoles: ["adp-upload", "hrp-upload", "isp-upload", "itp-upload", "lgp-upload", "mkp-upload", "fip-upload",
                        "psp-upload", "cgp-upload", "ssp-upload", "hr1-upload", "hr2-upload", "hr3-upload", "hr4-upload", "ism-upload",
                        "adp-upload-us"],
    invSubContractReceiverRoles: ["hrp-receiver"],
    functionalHeadRoles: ["functional_head"],
    financeRoles: ["finance"],
    empanelmentRoles: ["empanelment"],
    procurementRoles: ["procurement"],
    vendorRoles: ["vendor"],
    tempVendorRoles: ["vendor-temp"],
    vendorReportViewerRoles: ["vendor-report"],
    invoiceReportViewerRoles: ["invoice-report"],
    supportedCountries: ["IN", "US"],
    companyCodes: {
        "ADP": countryCompanyCodes.indiaCompanyCodes,
        "ADP-US": countryCompanyCodes.usCompanyCodes
    },
    indiaCountryCode: "IN",
    usCountryCode: "US",
    // countryByCompanyCode: {
    //     "7510": "IN",
    //     "7520": "IN",
    //     "7010": "US",
    //     "7020": "US"
    // },
    userDetails: {
        userId: "",
        userEmail: "",
        userName: "",
        departmentHead: null,
        userRoles: [],
        isVendor: false,
        isInvoiceUploader: false,
        isSubContractReceiver: false,
        isPurchaseOwner: false,
        isFunctionalHead: false,
        isProcurement: false,
        isFinance: false,
        isEmpanelment: false,
        isTempVendor: false,
        isVendorReportViewer: false,
        isInvoiceReportViewer: false,
        poDepts: [],
        functionalHeadDepts: [],
        functionalHeadProjects: [],
        invDepts: []
    },
    sessionTimeout: {
        idle: 1200,
        timeout: 300,
        ping: 120
    }
}