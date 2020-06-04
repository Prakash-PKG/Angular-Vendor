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
            this._appService.vendorRegistrationDetails.panNum = this.vendorDocumentForm.get("panNum").value;
            this._appService.vendorRegistrationDetails.gstNum = this.vendorDocumentForm.get("gstNum").value;
            this._appService.vendorRegistrationDetails.pfNum = this.vendorDocumentForm.get("pfNum").value;
            this._appService.vendorRegistrationDetails.esiNum = this.vendorDocumentForm.get("esiNum").value;
            this._appService.vendorRegistrationDetails.cinNum = this.vendorDocumentForm.get("cinNum").value;
            this._appService.vendorRegistrationDetails.isSez = this.vendorDocumentForm.get("isSez").value;
            this._appService.vendorRegistrationDetails.isRcmApplicable = this.vendorDocumentForm.get("isRcmApplicable").value;
            this._appService.vendorRegistrationDetails.isMsmedRegistered = this.vendorDocumentForm.get("isMsmedRegistered").value;
            this._appService.vendorRegistrationDetails.hasTdsLower = this.vendorDocumentForm.get("hasTdsLower").value;
            this._appService.vendorRegistrationDetails.lutNum = this.vendorDocumentForm.get("lutNum").value;
            this._appService.vendorRegistrationDetails.lut_date = this.vendorDocumentForm.get("lut_date").value;
           
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
        this.vendorDocumentForm.get("panNum").setValue(this._appService.vendorRegistrationDetails.panNum);
        this.vendorDocumentForm.get("gstNum").setValue(this._appService.vendorRegistrationDetails.gstNum);
        this.vendorDocumentForm.get("pfNum").setValue(this._appService.vendorRegistrationDetails.pfNum);
        this.vendorDocumentForm.get("esiNum").setValue(this._appService.vendorRegistrationDetails.esiNum);
        this.vendorDocumentForm.get("cinNum").setValue(this._appService.vendorRegistrationDetails.cinNum);
        this.vendorDocumentForm.get("isSez").setValue(this._appService.vendorRegistrationDetails.isSez);
        this.vendorDocumentForm.get("isRcmApplicable").setValue(this._appService.vendorRegistrationDetails.isRcmApplicable);
        this.vendorDocumentForm.get("isMsmedRegistered").setValue(this._appService.vendorRegistrationDetails.isMsmedRegistered);
        this.vendorDocumentForm.get("hasTdsLower").setValue(this._appService.vendorRegistrationDetails.hasTdsLower);
        this.vendorDocumentForm.get("lutNum").setValue(this._appService.vendorRegistrationDetails.lutNum);
        this.vendorDocumentForm.get("lut_date").setValue(this._appService.vendorRegistrationDetails.lut_date);
    }

    ngOnInit() {
        this.documentsList = [];
        if(this._appService.vendorRegistrationInitDetails && this._appService.vendorRegistrationInitDetails.documentDetailsList &&
            this._appService.vendorRegistrationInitDetails.documentDetailsList.length > 0) {
                this.documentsList = this._appService.vendorRegistrationInitDetails.documentDetailsList;
        }

        this.vendorDocumentForm = this._formBuilder.group({
          
            panNum: [null, [Validators.required]],
            gstNum: [null, [Validators.required]],
            pfNum:[null],
            esiNum:[null],
            cinNum:[null],
            isSez:[null],
            isRcmApplicable:[null],
            isMsmedRegistered:[null],
            hasTdsLower:[null],
            lutNum:[null],
            lut_date:[null]
            
        });

        this.updateVendorDetails();
    }

}
