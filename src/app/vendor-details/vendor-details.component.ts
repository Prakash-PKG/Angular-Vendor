import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AppService } from '../app.service';
import { VendorRegistrationService } from './../vendor-registration/vendor-registration.service';

import { BusyDataModel, VendorRegistrationRequestModel, VendorRegistrationResultModel } from './../models/data-models';
import { HomeService } from '../home/home.service';

@Component({
    selector: 'app-vendor-details',
    templateUrl: './vendor-details.component.html',
    styleUrls: ['./vendor-details.component.scss']
})
export class VendorDetailsComponent implements OnInit {

    vendorDetailsForm: FormGroup;
    failureMsg: string = "";
    requiredErrorMsg: string = "This field is mandatory"

    constructor(private _appService: AppService,
        private _vendorRegistrationService: VendorRegistrationService,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _homeService:HomeService ) { }

    onNextClick() {
        // this._router.navigate([this._appService.routingConstants.vendorAddressDetails]);
        this.failureMsg = "";

        if (this.vendorDetailsForm.valid) {

            this._appService.vendorRegistrationDetails.vendorName = this.vendorDetailsForm.get("vendorName").value;
            this._appService.vendorRegistrationDetails.contactPerson = this.vendorDetailsForm.get("contactPerson").value;
            this._appService.vendorRegistrationDetails.mobileNum = this.vendorDetailsForm.get("mobileNum").value;
            this._appService.vendorRegistrationDetails.telephoneNum = this.vendorDetailsForm.get("telephoneNum").value;
            this._appService.vendorRegistrationDetails.emailId = this.vendorDetailsForm.get("emailId").value;
            this._appService.vendorRegistrationDetails.password = this.vendorDetailsForm.get("password").value;

            let req: VendorRegistrationRequestModel = {
                action: this._appService.updateOperations.save,
                vendorMasterDetails: this._appService.vendorRegistrationDetails
            }
            this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: true, msg: null });
            this._vendorRegistrationService.updateVendorRegistrationDetails(req)
                .subscribe(response => {
                    this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

                    if (response.body) {
                        let result: VendorRegistrationResultModel = response.body as VendorRegistrationResultModel;
                        if (result.status.status == 200 && result.status.isSuccess) {
                            this._appService.vendorRegistrationDetails = result.vendorMasterDetails;
                            this._router.navigate([this._appService.routingConstants.vendorAddressDetails]);
                           
                        }
                        else {
                            this.failureMsg = this._appService.messages.vendorRegistrationSaveFailure;
                        }
                    }
                },
                    (error) => {
                        this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                        console.log(error);
                    });
        }
    }

    updateVendorDetails() {
        this.vendorDetailsForm.get("vendorName").setValue(this._appService.vendorRegistrationDetails.vendorName);
        this.vendorDetailsForm.get("contactPerson").setValue(this._appService.vendorRegistrationDetails.contactPerson);
        this.vendorDetailsForm.get("mobileNum").setValue(this._appService.vendorRegistrationDetails.mobileNum);
        this.vendorDetailsForm.get("telephoneNum").setValue(this._appService.vendorRegistrationDetails.telephoneNum);
        this.vendorDetailsForm.get("emailId").setValue(this._appService.vendorRegistrationDetails.emailId);
        this.vendorDetailsForm.get("password").setValue(this._appService.vendorRegistrationDetails.password);
        this.vendorDetailsForm.get("confirmPassword").setValue(this._appService.vendorRegistrationDetails.password);
    }

    ngOnInit() {
        this.vendorDetailsForm = this._formBuilder.group({
            vendorName: [null, [Validators.required]],
            contactPerson: [null],
            // contactNum: [null, [Validators.required]],
            mobileNum: [null, [Validators.required]],
            telephoneNum: [null],
            emailId: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required]],
            confirmPassword: [null, [Validators.required]]
        });
        this._homeService.updateCurrentPageDetails({ pageName: 'venDetails' });
                this.updateVendorDetails();
    }

}
