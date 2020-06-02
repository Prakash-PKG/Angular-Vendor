import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { HomeService } from './../home/home.service';
import { AppService } from '../app.service';
import { VendorRegistrationService } from './../vendor-registration/vendor-registration.service';

import { BusyDataModel, VendorRegistrationRequestModel, VendorRegistrationResultModel, VendorMasterDocumentModel } from './../models/data-models';

@Component({
    selector: 'app-vendor-documents',
    templateUrl: './vendor-documents.component.html',
    styleUrls: ['./vendor-documents.component.scss']
})
export class VendorDocumentsComponent implements OnInit {

    vendorDocumentForm: FormGroup;
    failureMsg: string = "";
    documentsList: VendorMasterDocumentModel[] = [];

    constructor(private _appService: AppService,
        private _homeService: HomeService,
        private _vendorRegistrationService: VendorRegistrationService,
        private _router: Router,
        private _formBuilder: FormBuilder) { }

    onPrevClick() {
        this._router.navigate([this._appService.routingConstants.vendorBankDetails]);
    }

    onSubmitClick() {
        this.failureMsg = "";

        if (this.vendorDocumentForm.valid) {

            this._appService.vendorRegistrationDetails.gstNum = this.vendorDocumentForm.get("gstNum").value;
            this._appService.vendorRegistrationDetails.panNum = this.vendorDocumentForm.get("panNum").value;

            let req: VendorRegistrationRequestModel = {
                action: this._appService.updateOperations.submit,
                vendorMasterDetails: this._appService.vendorRegistrationDetails
            }
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: null });
            this._vendorRegistrationService.updateVendorRegistrationDetails(req)
                .subscribe(response => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

                    if (response.body) {
                        let result: VendorRegistrationResultModel = response.body as VendorRegistrationResultModel;
                        if (result.status.status == 200 && result.status.isSuccess) {
                            this._appService.vendorRegistrationDetails = result.vendorMasterDetails;
                            this.failureMsg = this._appService.messages.vendorRegistrationSubmitSuccessMsg;
                        }
                        else {
                            this.failureMsg = this._appService.messages.vendorRegistrationSaveFailure;
                        }
                    }
                },
                (error) => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    console.log(error);
                });
        }
    }

    updateVendorDetails() {
        this.vendorDocumentForm.get("gstNum").setValue(this._appService.vendorRegistrationDetails.gstNum);
        this.vendorDocumentForm.get("panNum").setValue(this._appService.vendorRegistrationDetails.panNum);
    }

    ngOnInit() {
        this.documentsList = [];
        if(this._appService.vendorRegistrationInitDetails && this._appService.vendorRegistrationInitDetails.documentDetailsList &&
            this._appService.vendorRegistrationInitDetails.documentDetailsList.length > 0) {
                this.documentsList = this._appService.vendorRegistrationInitDetails.documentDetailsList;
        }

        this.vendorDocumentForm = this._formBuilder.group({
            gstNum: [null, [Validators.required]],
            panNum: [null, [Validators.required]]
        });

        this.updateVendorDetails();
    }

}
