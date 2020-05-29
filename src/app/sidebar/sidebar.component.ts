import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { HomeService } from '../home/home.service';
import { transition, animate, state, style, trigger } from '@angular/animations';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    animations: [
        trigger('visibilityChanged', [
            state('true', style({
                overflow: 'hidden',
                height: '*',
                opacity: 1
            })),
            state('false', style({
                opacity: 0,
                overflow: 'hidden',
                height: '0px'
            })),
            transition('true <=> false', animate('0.5s ease-in-out'))
        ]),
        trigger('collapseChanged', [
            state('true', style({
                overflow: 'hidden',
                width: '4em',
                opacity: 1
            })),
            state('false', style({
                opacity: 1,
                overflow: 'hidden',
                width: '24%'
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
