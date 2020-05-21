import { Component, OnInit } from '@angular/core';

import { NgxSpinnerService } from 'ngx-spinner';

import { HomeService } from './home.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    private _busySubscription: any = null;

    spinnerCls: string = "";
    busyMsg: string = "Please wait...";

    isHeaderRequired: boolean = true;

    constructor(private _homeService: HomeService,
                private _spinner: NgxSpinnerService) { }

    ngOnDestroy() {
        if (this._busySubscription) {
            this._busySubscription.unsubscribe();
        }
    }

    ngOnInit() {
        let spin = this._spinner;
        this._busySubscription = this._homeService.isBusy.subscribe(data => {
            if(data && data.isBusy == true) {
                spin.show();
                this.spinnerCls = "overlay";
                //this.busyMsg = (data.msg) ? data.msg : "Please wait...";
                this.busyMsg = "Please wait...";
            }
            else {
                spin.hide();
                this.spinnerCls = "";
            }
        });
    }

}
