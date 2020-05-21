import { BusyDataModel, PageDetailsModel } from './../models/data-models';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HomeService {
    // Based on this, Busy icon will show
    private busy = new BehaviorSubject<BusyDataModel>(<BusyDataModel>{isBusy: false, msg: null});
    isBusy = this.busy.asObservable();

    // Based on this, can identify current page
    private pgDetails = new BehaviorSubject<PageDetailsModel>(<PageDetailsModel>{pageName: ""});
    currentPageDetails = this.pgDetails.asObservable();

    constructor() { }

    // Updates Busy status
    updateBusy(obj: BusyDataModel) {
        this.busy.next(obj)
    }

    // Updates current page details
    updateCurrentPageDetails(obj: PageDetailsModel) {
         this.pgDetails.next(obj)
    }
}
