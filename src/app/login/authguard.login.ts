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
    userRole: string;
    //private cryptoService:CryptoService, private commonService:CommonService,
    constructor(private authService: LoginService, private router: Router, private cryptoService: CryptoService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        let routeRoles = route.data["roles"] as Array<string>;
        let isAuthorizesUser: boolean = false;
        if (!localStorage.getItem("x-auth-token")) {
            this.router.navigate(['login']);
            // return false;
            return true;
        } else {
            // let user = JSON.parse(localStorage.getItem('user'));
            // let encryptedRole = localStorage.getItem('authorizeToken');
            // let userRole = this.cryptoService.decrypt(encryptedRole);
            // below is commented by mine
            //   let userRole = this.commonService.getUserRole();
            //     if(routeRoles.indexOf(userRole) != -1){
            //       isAuthorizesUser=true;
            //     }


            let user = localStorage.getItem('user');
            user = this.cryptoService.decrypt(user);
            const userDetails = JSON.parse(user);
            this.userRole = userDetails.userRoles;
            this.userName = userDetails.userName;
            this.userEmail = userDetails.userEmail;
            this.userId = userDetails.userId;

            globalConstant.userDetails.userId = this.userId;
            globalConstant.userDetails.userEmail = this.userEmail;
            globalConstant.userDetails.userName = this.userName;
            globalConstant.userDetails.userRoles = this.userRole;

            globalConstant.userDetails.isAdmin = false;
            globalConstant.userDetails.isManager = false;
            globalConstant.userDetails.isDUHead = false;
             globalConstant.userDetails.isFinance = false;
             
            if(globalConstant.userDetails.userRoles && globalConstant.userDetails.userRoles.length > 0) {
                let adminRoles = globalConstant.userDetails.userRoles.filter(r => r.name == "Admin");
                if(adminRoles && adminRoles.length > 0) {
                    globalConstant.userDetails.isAdmin = true;
                }
                else {
                    globalConstant.userDetails.isAdmin = false;
                }

                let managerRoles = globalConstant.userDetails.userRoles.filter(r => r.name == "Manager");
                if(managerRoles && managerRoles.length > 0) {
                    globalConstant.userDetails.isManager = true;
                }
                else {
                    globalConstant.userDetails.isManager = false;
                }

                let duHeadRoles = globalConstant.userDetails.userRoles.filter(r => r.name == "DU-Head");
                if(duHeadRoles && duHeadRoles.length > 0) {
                    globalConstant.userDetails.isDUHead = true;
                }
                else {
                    globalConstant.userDetails.isDUHead = false;
                }

                let financeRoles = globalConstant.userDetails.userRoles.filter(r => r.name == "Finance");
                if(financeRoles && financeRoles.length > 0) {
                    globalConstant.userDetails.isFinance = true;
                }
                else {
                    globalConstant.userDetails.isFinance = false;
                }
            }
            
            let proxyUser = localStorage.getItem('proxyUser');
            proxyUser = this.cryptoService.decrypt(proxyUser);
            const proxyUserDetails = JSON.parse(proxyUser);

            globalConstant.proxyUserDetails.userId = proxyUserDetails.userId;
            globalConstant.proxyUserDetails.userEmail = proxyUserDetails.userEmail;
            globalConstant.proxyUserDetails.userName = proxyUserDetails.userName;
            globalConstant.proxyUserDetails.userRoles = proxyUserDetails.userRole;


            // let encryptedRole = localStorage.getItem('authorizeToken');
            // let userRole = this.cryptoService.decrypt(encryptedRole);
            // below is commented by mine
            //   let userRole = this.commonService.getUserRole();
            //     if(routeRoles.indexOf(userRole) != -1){
            //       isAuthorizesUser=true;
            //     }
           
            return true;
        }
        //return true;
    }
}
