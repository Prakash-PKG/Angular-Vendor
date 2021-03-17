import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AppService } from '../app.service';
import { VendorRegistrationService } from './../vendor-registration/vendor-registration.service';

import { BusyDataModel, VendorRegistrationRequestModel, VendorRegistrationResultModel } from './../models/data-models';
import { HomeService } from '../home/home.service';
import { equalValueValidator } from '../common/equal-value-validator';

@Component({
    selector: 'app-vendor-details',
    templateUrl: './vendor-details.component.html',
    styleUrls: ['./vendor-details.component.scss']
})
export class VendorDetailsComponent implements OnInit {

    vendorDetailsForm: FormGroup;
    failureMsg: string = "";
    requiredErrorMsg: string = "This field is mandatory";
    isSubmitted: boolean = false;
    vendorCounty: string = "";
    constructor(private _appService: AppService,
        private _vendorRegistrationService: VendorRegistrationService,
        private _router: Router,
        private _formBuilder: FormBuilder) { }

    get f() { return this.vendorDetailsForm.controls; }

    onNextClick() {
        // this._router.navigate([this._appService.routingConstants.vendorAddressDetails]);
        this.failureMsg = "";
        this.isSubmitted = true;
        if (this.vendorDetailsForm.valid) {
            this._appService.vendorRegistrationDetails.vendorName = this.vendorDetailsForm.get("vendorName").value;
            this._appService.vendorRegistrationDetails.contactPerson = this.vendorDetailsForm.get("contactPerson").value;
            this._appService.vendorRegistrationDetails.mobileNum = this.vendorDetailsForm.get("mobileNum").value;
            this._appService.vendorRegistrationDetails.telephoneNum = this.vendorDetailsForm.get("telephoneNum").value;
            this._appService.vendorRegistrationDetails.emailId = this.vendorDetailsForm.get("emailId").value;
            this._appService.vendorRegistrationDetails.password = this.vendorDetailsForm.get("password").value;
            this._appService.vendorRegistrationDetails.usVendorBusiness=this.vendorDetailsForm.get("usVendorBusiness").value;

            let req: VendorRegistrationRequestModel = {
                action: this._appService.updateOperations.save,
                vendorMasterDetails: this._appService.vendorRegistrationDetails
            }

            // console.log(req);
            // this._router.navigate([this._appService.routingConstants.vendorAddressDetails]);

            this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: true, msg: null });
            this._vendorRegistrationService.updateVendorRegistrationDetails(req)
                .subscribe(response => {
                    this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

                    if (response.body) {
                        let result: VendorRegistrationResultModel = response.body as VendorRegistrationResultModel;
                        if (result.status.status == 200) {
                            if (result.status.isSuccess) {
                                this._appService.vendorRegistrationDetails = result.vendorMasterDetails;
                                this._router.navigate([this._appService.routingConstants.vendorAddressDetails]);
                            }
                            else {
                                this.failureMsg = result.status.message;
                            }
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
        else {
            this.failureMsg = this._appService.messages.vendorRegistrationFormInvalid;
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
        this.vendorDetailsForm.get("usVendorBusiness").setValue(this._appService.vendorRegistrationDetails.usVendorBusiness);
    }
    isNumberKey(evt) {
        let charCode = (evt.which) ? evt.which : evt.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;

        return true;
    }

    ngOnInit() {
        this.vendorCounty=this._appService.countyNm;
        console.log("Country     "+this.vendorCounty);
       this.isSubmitted = false;
        this.vendorDetailsForm = this._formBuilder.group({
            vendorName: [null, [Validators.required, Validators.nullValidator]],
            contactPerson: [null],
            mobileNum: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.nullValidator, Validators.pattern("^[0-9]*$")]],
            telephoneNum: [null, [Validators.maxLength(12), Validators.minLength(11), Validators.pattern("^[0-9]*$")]],
            emailId: [null, [Validators.required, Validators.email, Validators.nullValidator]],
            password: [null, [Validators.required, Validators.nullValidator, Validators.pattern(/^(?:(?:(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]))|(?:(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[]:;<>,.?~_+-=|\]))|(?:(?=.*[0-9])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[]:;<>,.?~_+-=|\]))|(?:(?=.*[0-9])(?=.*[a-z])(?=.*[*.!@$%^&(){}[]:;<>,.?~_+-=|\]))).{8,}$/)]],
            confirmPassword: [null, [Validators.required, Validators.nullValidator]],
            usVendorBusiness: [null]
        },
            { validator: equalValueValidator('password', 'confirmPassword') }
        );
        this._vendorRegistrationService.updateCurrentPageDetails({ pageName: 'venDetails' });
        this.updateVendorDetails();
        
    }

}
