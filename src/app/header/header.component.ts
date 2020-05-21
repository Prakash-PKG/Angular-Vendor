import { Component, OnInit } from '@angular/core';
import { HomeService } from './../home/home.service';
import { AppService } from './../app.service';
import { HeaderService } from './header.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    constructor() {
    }

    ngOnInit() {
        
    }
}
