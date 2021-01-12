
export const globalConstant : any = {
    poRoles: ["adp", "hrp", "isp", "itp", "lgp", "mkp", 'fip', 'psp', 'cgp', 'ssp', 'isp', 'hr1', 'hr2', 'hr3', 'hr4', 'ism'],
    invUploadRoles: ["adp-upload", "hrp-upload", "isp-upload", "itp-upload", "lgp-upload", "mkp-upload", "fip-upload",
                        "psp-upload", "cgp-upload", "ssp-upload", "hr1-upload", "hr2-upload", "hr3-upload", "hr4-upload", "ism-upload"],
    invSubContractReceiverRoles: ["hrp-receiver"],
    functionalHeadRoles: ["functional_head"],
    financeRoles: ["finance"],
    empanelmentRoles: ["empanelment"],
    procurementRoles: ["procurement"],
    vendorRoles: ["vendor"],
    tempVendorRoles: ["vendor-temp"],
    vendorReportViewerRoles: ["vendor-report"],
    invoiceReportViewerRoles: ["invoice-report"],
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