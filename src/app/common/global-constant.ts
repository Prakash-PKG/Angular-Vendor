
export const globalConstant : any = {
    poRoles: ["adp", "hrp", "isp", "itp", "lgp", "mkp", 'fip'],
    invUploadRoles: ["adp-upload", "hrp-upload", "isp-upload", "itp-upload", "lgp-upload", "mkp-upload", "fip-upload"],
    functionalHeadRoles: ["functional_head"],
    financeRoles: ["finance"],
    empanelmentRoles: ["empanelment"],
    procurementRoles: ["procurement"],
    vendorRoles: ["vendor"],
    tempVendorRoles: ["vendor-temp"],
    userDetails: {
        userId: "",
        userEmail: "",
        userName: "",
        departmentHead: null,
        userRoles: [],
        isVendor: false,
        isInvoiceUploader: false,
        isPurchaseOwner: false,
        isFunctionalHead: false,
        isProcurement: false,
        isFinance: false,
        isEmpanelment: false,
        isTempVendor: false,
        poDepts: [],
        invDepts: []
    }
}