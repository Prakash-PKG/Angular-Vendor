import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { HomeService } from '../home/home.service';
import { transition, animate, state, style, trigger } from '@angular/animations';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    animations: [
        trigger('collapseChanged', [
            state('true', style({
                width: '4em',
            })),
            state('false', style({
                width: '20%'
            })),
            transition('true <=> false', animate('0.5s ease-in-out'))
        ])
    ]
})
export class SidebarComponent implements OnInit {
    isSidebarCollapsed: boolean = false;
    isMenuTextVisible: boolean = true;

    constructor(private _appService: AppService,
        private _homeService: HomeService) { }

    onCollapseClick() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;

        if (this.isSidebarCollapsed == false) {
            setTimeout(() => {
                this.isMenuTextVisible = true;
            }, 500);
        }
        else {
            this.isMenuTextVisible = false;
        }

        this._homeService.updateSidebarDetails(this.isSidebarCollapsed);
    }

    ngOnInit() {

        this.isSidebarCollapsed = false;
        this._homeService.updateSidebarDetails(this.isSidebarCollapsed);
    }
}
