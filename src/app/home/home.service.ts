import { BusyDataModel, PageDetailsModel } from './../models/data-models';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HomeService {
    // Based on this, Busy icon will show
    private busy = new BehaviorSubject<BusyDataModel>(<BusyDataModel>{ isBusy: false, msg: null });
    isBusy = this.busy.asObservable();

    // Based on this, Sidebar expansion and collapse details can be identified
    private sidebarCollapsed = new BehaviorSubject<boolean>(false);
    isSidebarCollapsed = this.sidebarCollapsed.asObservable();

    // Based on this, Logout is happenned due to session expire or not
    private sessioonExpired = new BehaviorSubject<boolean>(false);
    isSessionExpired = this.sessioonExpired.asObservable();

    constructor() { }

    // Updates Busy status
    updateBusy(obj: BusyDataModel) {
        this.busy.next(obj)
    }

    // Updates sidebar exapansion and collapse details 
    updateSidebarDetails(obj: boolean) {
        this.sidebarCollapsed.next(obj)
    }

    // Updates session expired status
    updateSessionExpireDetails(obj: boolean) {
        this.sessioonExpired.next(obj)
    }

}
