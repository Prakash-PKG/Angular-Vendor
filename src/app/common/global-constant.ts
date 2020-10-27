
export const globalConstant : any = {
    poRoles: ["adp", "hrp", "isp", "itp", "lgp", "mkp", 'fip'],
    invUploadRoles: ["adp-upload", "hrp-upload", "isp-upload", "itp-upload", "lgp-upload", "mkp-upload", "fip-upload"],
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