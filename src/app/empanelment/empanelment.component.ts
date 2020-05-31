
import { EmpanelmentSubmitReqModel } from './../models/data-models';
import { EmpanelmentService } from './empanelment.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-empanelment',
    templateUrl: './empanelment.component.html',
    styleUrls: ['./empanelment.component.scss']
})
export class EmpanelmentComponent implements OnInit {

    empanelmentForm: FormGroup;
    message: string = "";

    constructor(private _empanelmentService: EmpanelmentService,
                private _formBuilder: FormBuilder) { }

    ngOnInit() {
        this.empanelmentForm = this._formBuilder.group({
            emailId: [null, [Validators.required, Validators.email]],
        });
    }

    onEmpanelmentClick() {
        this.message = "";
        if (this.empanelmentForm.valid) {
            let req: EmpanelmentSubmitReqModel = {
                emailId: this.empanelmentForm.get("emailId").value,
                sentBy: "105173"
            }

            this._empanelmentService.submitEmpanelmentReq(req)
                .subscribe(response => {

                   this.message = response.body["status"].message;
                    //this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                },
                (error) => {
                    //this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    console.log(error);
                });
        }
    }
}
