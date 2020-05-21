
import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AppService {

    readonly domain = "http://localhost:8080";
    //readonly domain = "https://mvendor-dev.marlabs.com";  
    //readonly domain = "https://mtime.marlabs.com";  
    readonly baseUrl = this.domain + "/mtime/";
    readonly customerAuthUrl = this.domain + "/customerAuth/oauth/token";
    readonly isForProduction: boolean = false;

    constructor(private _datePipe: DatePipe) { }

    readonly routingConstants: any = {
        login: "/"
    };

    readonly pageConstants: any = {
        login: "Login"
    };

    readonly dbDateFormat: string = "yyyy-MM-dd"; // Server and DB expects this format, by changing this it will reflect in all places
    readonly displayDtFormat: string = "dd MMM yyyy"; // Displays dates in this format. By changing this, total application date formats will change
    
    getFormattedDate(dtStr: string) {
        if(dtStr) {
            return this._datePipe.transform(new Date(dtStr), this.displayDtFormat);
        }
        
        return "";
    }

}
