import { LoginComponent } from './login.component';
import { globalConstant } from './../common/global-constant';
import { CryptoService } from './../common/crypto.service';
import { LoginService } from './login.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthGuardLogin implements CanActivate {
    userName: string;
    userEmail: string;
    userId: string;
    userRole: string[];
    departmentHead: string;

    constructor(private authService: LoginService, private router: Router, private cryptoService: CryptoService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        let routeRoles = route.data["roles"] as Array<string>;
        let isAuthorizesUser: boolean = false;
        if (!localStorage.getItem("x-auth-token")) {
            this.router.navigate(['login']);

            return true;
        } else {
            let user = localStorage.getItem('user');
            user = this.cryptoService.decrypt(user);
            const userDetails = JSON.parse(user);
            this.userRole = userDetails.userRoles;
            this.userName = userDetails.userName;
            this.userEmail = userDetails.userEmail;
            this.userId = userDetails.userId;
            this.departmentHead = userDetails["department head"]

            globalConstant.userDetails.userId = this.userId;
            globalConstant.userDetails.userEmail = this.userEmail;
            globalConstant.userDetails.userName = this.userName;
            globalConstant.userDetails.departmentHead = this.departmentHead;
            globalConstant.userDetails.userRoles = this.userRole;

            globalConstant.userDetails.isVendor = false;
            globalConstant.userDetails.isInvoiceUploader = false;
            globalConstant.userDetails.isPurchaseOwner = false;
            globalConstant.userDetails.isFunctionalHead = false;
            globalConstant.userDetails.isProcurement = false;
            globalConstant.userDetails.isFinance = false;
            globalConstant.userDetails.isEmpanelment = false;
            globalConstant.userDetails.poDepts = [];

            if(globalConstant.userDetails.userRoles && globalConstant.userDetails.userRoles.length > 0) {
                let vendorRoles = globalConstant.userDetails.userRoles.filter(r => globalConstant.vendorRoles.indexOf(r.roleCode) > -1);
                if(vendorRoles && vendorRoles.length > 0) {
                    globalConstant.userDetails.isVendor = true;
                }
                else {
                    globalConstant.userDetails.isVendor = false;
                }

                let invUploadRoles = globalConstant.userDetails.userRoles.filter(r => globalConstant.invUploadRoles.indexOf(r.roleCode) > -1);
                if(invUploadRoles && invUploadRoles.length > 0) {
                    globalConstant.userDetails.isInvoiceUploader = true;
                    for(let pr = 0; pr < invUploadRoles.length; pr++) {
                        globalConstant.userDetails.poDepts.push(invUploadRoles[pr]["roleName"]);
                    }
                 }
                else {  
                    globalConstant.userDetails.isInvoiceUploader = false;
                }

                let poRoles = globalConstant.userDetails.userRoles.filter(r => globalConstant.poRoles.indexOf(r.roleCode) > -1);
                if(poRoles && poRoles.length > 0) {
                    globalConstant.userDetails.isPurchaseOwner = true;
                    for(let pr = 0; pr < poRoles.length; pr++) {
                        let curRole: string = poRoles[pr]["roleName"];
                        if(globalConstant.userDetails.poDepts.indexOf(curRole) < 0) {
                            globalConstant.userDetails.poDepts.push(curRole);
                        }
                    }
                 }
                else {  
                    globalConstant.userDetails.isPurchaseOwner = false;
                }

                let functionalHeadRoles = globalConstant.userDetails.userRoles.filter(r => globalConstant.functionalHeadRoles.indexOf(r.roleCode) > -1);
                if(functionalHeadRoles && functionalHeadRoles.length > 0) {
                    globalConstant.userDetails.isFunctionalHead = true;
                }
                else {
                    globalConstant.userDetails.isFunctionalHead = false;
                }

                let procurementRoles = globalConstant.userDetails.userRoles.filter(r => globalConstant.procurementRoles.indexOf(r.roleCode) > -1);
                if(procurementRoles && procurementRoles.length > 0) {
                    globalConstant.userDetails.isProcurement = true;
                }
                else {
                    globalConstant.userDetails.isProcurement = false;
                }

                let financeRoles = globalConstant.userDetails.userRoles.filter(r => globalConstant.financeRoles.indexOf(r.roleCode) > -1);
                if(financeRoles && financeRoles.length > 0) {
                    globalConstant.userDetails.isFinance = true;
                }
                else {
                    globalConstant.userDetails.isFinance = false;
                }

                let empanelmentRoles = globalConstant.userDetails.userRoles.filter(r => globalConstant.empanelmentRoles.indexOf(r.roleCode) > -1);
                if(empanelmentRoles && empanelmentRoles.length > 0) {
                    globalConstant.userDetails.isEmpanelment = true;
                }
                else {
                    globalConstant.userDetails.isEmpanelment = false;
                }
            }
           
            return true;
        }
    }
}
