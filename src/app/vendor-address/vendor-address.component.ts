import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AppService } from '../app.service';
import { VendorRegistrationService } from './../vendor-registration/vendor-registration.service';

import { BusyDataModel, VendorRegistrationRequestModel, VendorRegistrationResultModel, CountryDataModel, regionMasterVOList } from './../models/data-models';
import { HomeService } from '../home/home.service';

@Component({
    selector: 'app-vendor-address',
    templateUrl: './vendor-address.component.html',
    styleUrls: ['./vendor-address.component.scss']
})
export class VendorAddressComponent implements OnInit {

    vendorAddressForm: FormGroup;
    failureMsg: string = "";
    countryList: CountryDataModel[] = [];
    regionMasterVOList: regionMasterVOList[] = [];

    constructor(private _appService: AppService,
        private _vendorRegistrationService: VendorRegistrationService,
        private _router: Router,
        private _formBuilder: FormBuilder) { }

    onPrevClick() {
        this._router.navigate([this._appService.routingConstants.vendorDetails]);
    }

    onNextClick() {

        this.failureMsg = "";

        if (this.vendorAddressForm.valid) {
            this._appService.vendorRegistrationDetails.address1 = this.vendorAddressForm.get("address1").value;
            this._appService.vendorRegistrationDetails.address2 = this.vendorAddressForm.get("address2").value;
            this._appService.vendorRegistrationDetails.city = this.vendorAddressForm.get("city").value;
            this._appService.vendorRegistrationDetails.street = this.vendorAddressForm.get("street").value;
            this._appService.vendorRegistrationDetails.pincode = this.vendorAddressForm.get("pincode").value;
            this._appService.vendorRegistrationDetails.stateCode = this.vendorAddressForm.get("stateCode").value;
            this._appService.vendorRegistrationDetails.countryCode = this.vendorAddressForm.get("countryCode").value;

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
                            this._router.navigate([this._appService.routingConstants.vendorBankDetails]);
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
        this.vendorAddressForm.get("address1").setValue(this._appService.vendorRegistrationDetails.address1);
        this.vendorAddressForm.get("address2").setValue(this._appService.vendorRegistrationDetails.address2);
        this.vendorAddressForm.get("city").setValue(this._appService.vendorRegistrationDetails.city);
        this.vendorAddressForm.get("street").setValue(this._appService.vendorRegistrationDetails.street);
        this.vendorAddressForm.get("pincode").setValue(this._appService.vendorRegistrationDetails.pincode);
        this.vendorAddressForm.get("stateCode").setValue(this._appService.vendorRegistrationDetails.stateCode);
        this.vendorAddressForm.get("countryCode").setValue(this._appService.vendorRegistrationDetails.countryCode);
    }
    updateRegion() {
        this.regionMasterVOList = [];
        if (this._appService.vendorRegistrationInitDetails && this._appService.vendorRegistrationInitDetails.regionMasterVOList &&
            this._appService.vendorRegistrationInitDetails.regionMasterVOList.length > 0) {
            this.regionMasterVOList = this._appService.vendorRegistrationInitDetails.regionMasterVOList;
        }
        this.regionMasterVOList = this.regionMasterVOList.filter(r => r.countryCode == this.vendorAddressForm.get('countryCode').value)
    }

    ngOnInit() {
        this.countryList = [];
        if (this._appService.vendorRegistrationInitDetails && this._appService.vendorRegistrationInitDetails.countriesList &&
            this._appService.vendorRegistrationInitDetails.countriesList.length > 0) {
            this.countryList = this._appService.vendorRegistrationInitDetails.countriesList;
        }
        this.regionMasterVOList = [];
        if (this._appService.vendorRegistrationInitDetails && this._appService.vendorRegistrationInitDetails.regionMasterVOList &&
            this._appService.vendorRegistrationInitDetails.regionMasterVOList.length > 0) {
            this.regionMasterVOList = this._appService.vendorRegistrationInitDetails.regionMasterVOList;
        }
        this.vendorAddressForm = this._formBuilder.group({
            address1: [null, [Validators.required]],
            address2: [null],
            city: [null, [Validators.required]],
            street: [null, [Validators.required]],
            pincode: [null],
            stateCode: [null, [Validators.required]],
            countryCode: [null, [Validators.required]]
        });

        this._vendorRegistrationService.updateCurrentPageDetails({ pageName: 'venAdd' });
        this.updateVendorDetails();
    }

}
