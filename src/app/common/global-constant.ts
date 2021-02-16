
export const countryCompanyCodes: any = {
    indiaCompanyCodes: ["7510", "7520"],
    usCompanyCodes: ["7010", "7020"]
};

export const globalConstant : any = {
    poRoles: ["adp", "hrp", "isp", "itp", "lgp", "mkp", 'fip', 'psp', 'cgp', 'ssp', 'isp', 'hr1', 'hr2', 'hr3', 'hr4', 'ism',
                "adp-us","cgp-us","fip-us","hr1-us","hr2-us","hr3-us","hr4-us","ism-us","isp-us","itp-us","lgp-us","mkp-us"
                ,"psp-us","ssp-us"],
    invUploadRoles: ["adp-upload", "hrp-upload", "isp-upload", "itp-upload", "lgp-upload", "mkp-upload", "fip-upload",
                        "psp-upload", "cgp-upload", "ssp-upload", "hr1-upload", "hr2-upload", "hr3-upload", "hr4-upload", "ism-upload",
                        "adp-upload-us","cgp-upload-us","hr1-upload-us","hr2-upload-us","hr3-upload-us","hr4-upload-us"
                        ,"ism-upload-us","isp-upload-us","itp-upload-us","lgp-upload-us","mkp-upload-us","psp-upload-us","ssp-upload-us"],
    invSubContractReceiverRoles: ["hrp-receiver"],
    functionalHeadRoles: ["functional_head"],
    financeRoles: ["finance"],
    empanelmentRoles: ["empanelment"],
    procurementRoles: ["procurement"],
    vendorRoles: ["vendor"],
    tempVendorRoles: ["vendor-temp"],
    vendorReportViewerRoles: ["vendor-report"],
    invoiceReportViewerRoles: ["invoice-report"],
    invoiceDumpRoles: ["invoice-dump", "invoice-dump-us"],
    supportedCountries: ["IN", "US"],
    companyCodes: {
        "ADP": countryCompanyCodes.indiaCompanyCodes,
        "ADP-US": countryCompanyCodes.usCompanyCodes,
        "CGP": countryCompanyCodes.indiaCompanyCodes,
        "CGP-US": countryCompanyCodes.usCompanyCodes,
        "FIP": countryCompanyCodes.indiaCompanyCodes,
        "FIP-US": countryCompanyCodes.usCompanyCodes,
        "HR1": countryCompanyCodes.indiaCompanyCodes,
        "HR1-US": countryCompanyCodes.usCompanyCodes,
        "HR2": countryCompanyCodes.indiaCompanyCodes,
        "HR2-US": countryCompanyCodes.usCompanyCodes,
        "HR3": countryCompanyCodes.indiaCompanyCodes,
        "HR3-US": countryCompanyCodes.usCompanyCodes,
        "HR4": countryCompanyCodes.indiaCompanyCodes,
        "HR4-US": countryCompanyCodes.usCompanyCodes,
        "HRP": countryCompanyCodes.indiaCompanyCodes,
        "HRP-US": countryCompanyCodes.usCompanyCodes,
        "ISM": countryCompanyCodes.indiaCompanyCodes,
        "ISM-US": countryCompanyCodes.usCompanyCodes,
        "ISP": countryCompanyCodes.indiaCompanyCodes,
        "ISP-US": countryCompanyCodes.usCompanyCodes,
        "ITP": countryCompanyCodes.indiaCompanyCodes,
        "ITP-US": countryCompanyCodes.usCompanyCodes,
        "LGP": countryCompanyCodes.indiaCompanyCodes,
        "LGP-US": countryCompanyCodes.usCompanyCodes,
        "MKP": countryCompanyCodes.indiaCompanyCodes,
        "MKP-US": countryCompanyCodes.usCompanyCodes,
        "PSP": countryCompanyCodes.indiaCompanyCodes,
        "PSP-US": countryCompanyCodes.usCompanyCodes,
        "SSP": countryCompanyCodes.indiaCompanyCodes,
        "SSP-US": countryCompanyCodes.usCompanyCodes
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
        invDepts: [],
        isInvoiceDumpVisible: false
    },
    sessionTimeout: {
        idle: 1200,
        timeout: 300,
        ping: 120
    }
}