import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { CanExit } from './can-exit';

@Injectable({
    providedIn: 'root'  
})
export class CanExitGuard implements CanDeactivate<CanExit> {
    canDeactivate(component: CanExit) {
        if (component.canDeactivate) {
            return component.canDeactivate();
        }
        return true;
    }
}   