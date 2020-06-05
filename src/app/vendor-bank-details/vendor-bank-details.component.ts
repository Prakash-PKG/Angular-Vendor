import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AppService } from '../app.service';
import { VendorRegistrationService } from './../vendor-registration/vendor-registration.service';

import { BusyDataModel, VendorRegistrationRequestModel, VendorRegistrationResultModel, CountryDataModel, regionMasterVOList } from './../models/data-models';

@Component({
    selector: 'app-vendor-bank-details',
    templateUrl: './vendor-bank-details.component.html',
    styleUrls: ['./vendor-bank-details.component.scss']
})
export class VendorBankDetailsComponent implements OnInit {

    vendorBankForm: FormGroup;
    failureMsg: string = "";
    countryList: CountryDataModel[] = [];
    regionMasterVOList: regionMasterVOList[] = [];

    constructor(private _appService: AppService,
        private _vendorRegistrationService: VendorRegistrationService,
        private _router: Router,
        private _formBuilder: FormBuilder) { }

    onPrevClick() {
        this._router.navigate([this._appService.routingConstants.vendorAddressDetails]);
    }

    onNextClick() {
        // this._router.navigate([this._appService.routingConstants.vendorDocuments]);

        this.failureMsg = "";

        if (this.vendorBankForm.valid) {

            // this._appService.vendorRegistrationDetails.bankAddress = this.vendorBankForm.get("bankAddress").value;
            this._appService.vendorRegistrationDetails.accountNum = this.vendorBankForm.get("accountNum").value;
            this._appService.vendorRegistrationDetails.accountType = this.vendorBankForm.get("accountType").value;
            this._appService.vendorRegistrationDetails.accountName = this.vendorBankForm.get("accountName").value;
            this._appService.vendorRegistrationDetails.ifscCode = this.vendorBankForm.get("ifscCode").value;
            this._appService.vendorRegistrationDetails.bankName = this.vendorBankForm.get("bankName").value;
            this._appService.vendorRegistrationDetails.bankBranch = this.vendorBankForm.get("bankBranch").value;
            this._appService.vendorRegistrationDetails.bankCity = this.vendorBankForm.get("bankCity").value;
            this._appService.vendorRegistrationDetails.bankRegion = this.vendorBankForm.get("bankRegion").value;
            this._appService.vendorRegistrationDetails.bankCountry = this.vendorBankForm.get("bankCountry").value;
            this._appService.vendorRegistrationDetails.swiftIbanCode = this.vendorBankForm.get("swiftIbanCode").value;
            this._appService.vendorRegistrationDetails.routingBank = this.vendorBankForm.get("routingBank").value;
            this._appService.vendorRegistrationDetails.swiftInterm = this.vendorBankForm.get("swiftInterm").value;

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
                            this._router.navigate([this._appService.routingConstants.vendorDocuments]);
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
        // this.vendorBankForm.get("bankAddress").setValue(this._appService.vendorRegistrationDetails.bankAddress);
        this.vendorBankForm.get("accountNum").setValue(this._appService.vendorRegistrationDetails.accountNum);
        this.vendorBankForm.get("accountType").setValue(this._appService.vendorRegistrationDetails.accountType);
        this.vendorBankForm.get("accountName").setValue(this._appService.vendorRegistrationDetails.accountName);
        this.vendorBankForm.get("ifscCode").setValue(this._appService.vendorRegistrationDetails.ifscCode);
        this.vendorBankForm.get("bankName").setValue(this._appService.vendorRegistrationDetails.bankName);
        this.vendorBankForm.get("bankBranch").setValue(this._appService.vendorRegistrationDetails.bankBranch);
        this.vendorBankForm.get("bankCity").setValue(this._appService.vendorRegistrationDetails.bankCity);
        this.vendorBankForm.get("bankRegion").setValue(this._appService.vendorRegistrationDetails.bankRegion);
        this.vendorBankForm.get("bankCountry").setValue(this._appService.vendorRegistrationDetails.bankCountry);
        this.vendorBankForm.get("swiftIbanCode").setValue(this._appService.vendorRegistrationDetails.swiftIbanCode);
        this.vendorBankForm.get("routingBank").setValue(this._appService.vendorRegistrationDetails.routingBank);
        this.vendorBankForm.get("swiftInterm").setValue(this._appService.vendorRegistrationDetails.swiftInterm);
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
        this.vendorBankForm = this._formBuilder.group({
            // bankAddress: [null, [Validators.required]],
            accountNum: [null, [Validators.required]],
            accountType: [null, [Validators.required]],
            accountName: [null, [Validators.required]],
            ifscCode: [null, [Validators.required]],
            bankName: [null, [Validators.required]],
            bankBranch: [null, [Validators.required]],
            bankCity: [null, [Validators.required]],
            bankRegion: [null, [Validators.required]],
            bankCountry: [null, [Validators.required]],
            swiftIbanCode: [null],
            routingBank: [null],
            swiftInterm: [null],
        });

        this.updateVendorDetails();
    }

}
