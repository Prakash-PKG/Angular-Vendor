import { HomeService } from './home/home.service';
import { SidebarService } from './sidebar/sidebar.service';
import { AppService } from './app.service';
import { Component } from '@angular/core';
import { UserIdleService } from 'angular-user-idle';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'client-codebase';
    timeRemaining: number = 0;

    constructor(private _userIdleService: UserIdleService,
                private _homeService: HomeService,
                private _sidebarService: SidebarService,
                private _appService: AppService) {
    }

    onCancelClick() {
        this._appService.stopWatching();
        this._appService.restartTimer();
        this._appService.startWatching();
    }

    ngOnInit() {
        // Start watching when user idle is starting.
        this._userIdleService.onTimerStart().subscribe(count => 
            {
                //console.log(count);
                this.timeRemaining = 15 - count;
                if(this.timeRemaining == 15) {
                    this.timeRemaining = 0;
                }
            }
        );

        // Start watch when time is up.
        this._userIdleService.onTimeout().subscribe(() => { 
            //console.log('Time is up!');
            this._homeService.updateSessionExpireDetails(true);
            this._sidebarService.logout();
        });
    }
}
