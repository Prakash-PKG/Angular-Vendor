import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AppService } from '../app.service';
import { VendorRegistrationService } from './../vendor-registration/vendor-registration.service';

import { BusyDataModel, VendorRegistrationRequestModel, VendorRegistrationResultModel, CountryDataModel, regionMasterVOList, BankAccountTypeModel } from './../models/data-models';
import { HomeService } from '../home/home.service';

@Component({
    selector: 'app-vendor-bank-details',
    templateUrl: './vendor-bank-details.component.html',
    styleUrls: ['./vendor-bank-details.component.scss']
})
export class VendorBankDetailsComponent implements OnInit {

    vendorBankForm: FormGroup;
    failureMsg: string = "";
    countryList: CountryDataModel[] = [];
    bankAccountTypeList: BankAccountTypeModel[] = [];
    regionMasterVOList: regionMasterVOList[] = [];
    isSubmitted: boolean = false;

    constructor(private _appService: AppService,
        private _vendorRegistrationService: VendorRegistrationService,
        private _router: Router,
        private _formBuilder: FormBuilder) { }

    onIFSCblur() {
        let ifscVal = this.vendorBankForm.get("ifscCode").value;

        if (ifscVal) {
            this.vendorBankForm.get("ifscCode").setValue(ifscVal.toUpperCase());
        }
    }

    get f() { return this.vendorBankForm.controls; }

    updateControlsData() {
        this._appService.vendorRegistrationDetails.accountNum = this.vendorBankForm.get("accountNum").value;
        this._appService.vendorRegistrationDetails.bankAccountTypeId = this.vendorBankForm.get("accountType").value;
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
        this._appService.vendorRegistrationDetails.usBankSector = this.vendorBankForm.get("usBankSector").value;
        this._appService.vendorRegistrationDetails.usChequePayableTo = this.vendorBankForm.get("usChequePayableTo").value;
        this._appService.vendorRegistrationDetails.usChecqueMailingAddress = this.vendorBankForm.get("usChecqueMailingAddress").value;
    }

    onPrevClick() {
        this.updateControlsData();
        this._router.navigate([this._appService.routingConstants.vendorAddressDetails]);
    }
    showUSField() {
        return this._vendorRegistrationService.vendorUS;
        // return true;
    }

    onNextClick() {
        // this._router.navigate([this._appService.routingConstants.vendorDocuments]);

        this.failureMsg = "";
        this.isSubmitted = true;
        this.updateUSFieldsValidation();
        if (this.vendorBankForm.valid) {

            // this._appService.vendorRegistrationDetails.bankAddress = this.vendorBankForm.get("bankAddress").value;
            this.updateControlsData();

            let req: VendorRegistrationRequestModel = {
                action: this._appService.updateOperations.save,
                vendorMasterDetails: this._appService.vendorRegistrationDetails,
                vendorOrgCatogery: this._appService.vendorOrgCatogery,
                vendorOrgTypes: this._appService.vendorOrgTypes
            }

            // console.log(req);
            // this._router.navigate([this._appService.routingConstants.vendorDocuments]);

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
        else {
            this.failureMsg = this._appService.messages.vendorRegistrationFormInvalid;
        }
    }

    updateVendorDetails() {

        this.vendorBankForm.get("accountNum").setValue(this._appService.vendorRegistrationDetails.accountNum);
        this.vendorBankForm.get("accountType").setValue(this._appService.vendorRegistrationDetails.bankAccountTypeId);
        this.vendorBankForm.get("accountName").setValue(this._appService.vendorRegistrationDetails.accountName);
        this.vendorBankForm.get("ifscCode").setValue(this._appService.vendorRegistrationDetails.ifscCode);
        this.vendorBankForm.get("bankName").setValue(this._appService.vendorRegistrationDetails.bankName);
        this.vendorBankForm.get("bankBranch").setValue(this._appService.vendorRegistrationDetails.bankBranch);
        this.vendorBankForm.get("bankCity").setValue(this._appService.vendorRegistrationDetails.bankCity);
        this.vendorBankForm.get("bankRegion").setValue(this._appService.vendorRegistrationDetails.bankRegion);
        this.vendorBankForm.get("bankCountry").setValue(this._appService.vendorRegistrationDetails.bankCountry);
        this.vendorBankForm.get("usBankSector").setValue(this._appService.vendorRegistrationDetails.usBankSector);
        this.vendorBankForm.get("usChequePayableTo").setValue(this._appService.vendorRegistrationDetails.usChequePayableTo);
        this.vendorBankForm.get("usChecqueMailingAddress").setValue(this._appService.vendorRegistrationDetails.usChecqueMailingAddress);
        this.vendorBankForm.get("swiftIbanCode").setValue(this._appService.vendorRegistrationDetails.swiftIbanCode);
        this.vendorBankForm.get("routingBank").setValue(this._appService.vendorRegistrationDetails.routingBank);
        this.vendorBankForm.get("swiftInterm").setValue(this._appService.vendorRegistrationDetails.swiftInterm);

        this.updateRegion();
    }
    updateUSFieldsValidation() {
        if (this._vendorRegistrationService.vendorUS) {
            this.vendorBankForm.get("usBankSector").setValidators([Validators.required]);
            this.vendorBankForm.get("usChequePayableTo").setValidators([Validators.required]);
            this.vendorBankForm.get("usChecqueMailingAddress").setValidators([Validators.required]);
            this.vendorBankForm.get("usBankSector").updateValueAndValidity();
            this.vendorBankForm.get("usChequePayableTo").updateValueAndValidity();
            this.vendorBankForm.get("usChecqueMailingAddress").updateValueAndValidity();
        }
    }

    updateRegion() {
        this.regionMasterVOList = [];
        if (this._appService.vendorRegistrationInitDetails && this._appService.vendorRegistrationInitDetails.regionMasterVOList &&
            this._appService.vendorRegistrationInitDetails.regionMasterVOList.length > 0) {
            this.regionMasterVOList = this._appService.vendorRegistrationInitDetails.regionMasterVOList;
        }
        this.regionMasterVOList = this.regionMasterVOList.filter(r => r.countryCode == this.vendorBankForm.get('bankCountry').value);
    }

    onBankCountryChange() {
        this.vendorBankForm.get("bankRegion").setValue(null);
        this.updateRegion();
    }

    ngOnInit() {
        this.isSubmitted = false;
        if (this._appService.vendorRegistrationDetails && this._appService.vendorRegistrationDetails.vendorMasterId == null) {
            this._router.navigate([this._appService.routingConstants.vendorTempLogin]);
        }

        else {
            this.countryList = [];
            if (this._appService.vendorRegistrationInitDetails && this._appService.vendorRegistrationInitDetails.countriesList &&
                this._appService.vendorRegistrationInitDetails.countriesList.length > 0) {
                this.countryList = this._appService.vendorRegistrationInitDetails.countriesList;
            }

            this.bankAccountTypeList = [];
            if (this._appService.vendorRegistrationInitDetails && this._appService.vendorRegistrationInitDetails.bankAccountTypeList &&
                this._appService.vendorRegistrationInitDetails.bankAccountTypeList.length > 0) {
                this.bankAccountTypeList = this._appService.vendorRegistrationInitDetails.bankAccountTypeList;
            }

            this.vendorBankForm = this._formBuilder.group({
                // bankAddress: [null, [Validators.required]],
                accountNum: [null, [Validators.required]],
                accountType: [null, [Validators.required]],
                accountName: [null, [Validators.required]],
                ifscCode: [null, [Validators.required, Validators.maxLength(11), Validators.minLength(11), Validators.pattern(/^[a-zA-Z0-9]*([a-zA-Z]+[0-9]+|[0-9]+[a-zA-Z]+)[a-zA-Z0-9]*$/)]],
                bankName: [null, [Validators.required]],
                bankBranch: [null, [Validators.required]],
                bankCity: [null, [Validators.required]],
                bankRegion: [null, [Validators.required]],
                bankCountry: [null, [Validators.required]],
                swiftIbanCode: [null],
                routingBank: [null],
                swiftInterm: [null],
                usBankSector: [null],
                usChequePayableTo: [null],
                usChecqueMailingAddress: [null],
            });

            this._vendorRegistrationService.updateCurrentPageDetails({ pageName: 'venBank' });
            this.updateVendorDetails();
        }
    }
}
