import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AppService } from '../app.service';
import { VendorRegistrationService } from './../vendor-registration/vendor-registration.service';

import { BusyDataModel, VendorRegistrationRequestModel, VendorRegistrationResultModel, VendorMasterDocumentModel, FileDetailsModel, VendorDocumentReqModel, VendorDocumentResultModel, StatusModel } from './../models/data-models';
import { DatePipe } from '@angular/common';
import { HomeService } from '../home/home.service';
import { globalConstant } from '../common/global-constant';

@Component({
    selector: 'app-vendor-documents',
    templateUrl: './vendor-documents.component.html',
    styleUrls: ['./vendor-documents.component.scss']
})
export class VendorDocumentsComponent implements OnInit {

    vendorDocumentForm: FormGroup;
    failureMsg: string = "";
    documentsList: VendorMasterDocumentModel[] = [];
    filesList: FileDetailsModel[] = [];
    FileTypeId: number = null;

    constructor(private _appService: AppService,
        private _vendorRegistrationService: VendorRegistrationService,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _datePipe: DatePipe,
        private _homeService: HomeService) { }


    onFileChange(event: any) {
        this.filesList = [];
        if (event.target.files && event.target.files.length > 0) {
            for (let f = 0; f < event.target.files.length; f++) {
                let file = event.target.files[f];
                if (file) {
                    let fileDetails: FileDetailsModel = {
                        actualFileName: file.name,
                        uniqueFileName: null,
                        fileData: null,
                        documentTypeId: this.FileTypeId,
                        fileId: null,
                        createdDate: null,
                        createdBy: null
                    };
                    this.filesList.push(fileDetails);

                    let reader = new FileReader();
                    reader.onload = this._handleFileReaderLoaded.bind(this, file.name);
                    reader.readAsBinaryString(file);
                }
            }
        }
    }
    private _handleFileReaderLoaded(actualFileName, readerEvt) {
        let binaryString = readerEvt.target.result;
        let base64textString = btoa(binaryString);

        for (let fileItem of this.filesList) {
            if (fileItem.actualFileName == actualFileName) {
                fileItem.fileData = base64textString;
                break;
            }
        }
    }

    onBrowseFileClick(event: any) {
        event.preventDefault();

        let element: HTMLElement = document.getElementById("invoiceFileCtrl");
        element.click();
    }
    onAttachFileClick() {
    this.filesList.forEach(e=>e.documentTypeId==1);// hardcoded // need to be change as per file type

        let filesReq: VendorDocumentReqModel = {
            userId: globalConstant.userDetails.isVendor ? globalConstant.userDetails.userEmail : globalConstant.userDetails.userId,
            fileDetails: this.filesList
        }

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Attaching..." });
        this._vendorRegistrationService.uploadVendorDocuments(filesReq)
            .subscribe(response => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                if (response.body) {
                    let results: VendorDocumentResultModel = response.body as VendorDocumentResultModel; 

                    if (results.status.status == 200 && results.status.isSuccess) {
                        this.filesList = [];
                        this.filesList = results.fileDetails.concat();
                    }
                }
            },
                (error) => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    console.log(error);
                });
    }
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
            this._appService.vendorRegistrationDetails.lutDate = this._datePipe.transform(this.vendorDocumentForm.get("lutDate").value, this._appService.dbDateFormat);

            let req: VendorRegistrationRequestModel = {
                action: this._appService.updateOperations.submit,
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
                            this.failureMsg = this._appService.messages.vendorRegistrationSubmitSuccessMsg;
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

    onDeleteFileClick(fileDetails: FileDetailsModel, fileIndex: number, fileType: string) {
        if(fileDetails.fileId) {
            this._homeService.updateBusy(<BusyDataModel>{isBusy: true, msg: "Deleting..."});
            this._vendorRegistrationService.deleteVendorFile(fileDetails)
                .subscribe(response => {
                    this._homeService.updateBusy(<BusyDataModel>{isBusy: false, msg: null});
                    let result = response.body as StatusModel;
                    if(result.isSuccess) {
                        this.removefileFromList(fileIndex, fileType);
                    }
                },
                (error) => {
                    this._homeService.updateBusy(<BusyDataModel>{isBusy: false, msg: null});
                    console.log(error);
                });
        }
        else {
            this.removefileFromList(fileIndex, fileType);
        }
    }

    removefileFromList(fileIndex: number, fileType: string) {
        if(fileType == 'invoice') {
            if(this.filesList.length > 0) {
                this.filesList.splice(fileIndex, 1);
            }
        }
    }

    downloadFile(fileDetails: FileDetailsModel) {
        this._appService.downloadInvoiceFile(fileDetails);
    }

    onFileTypeChange(docTYpe) {

    }
    prepareFileType() {

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
        this.vendorDocumentForm.get("lutDate").setValue(new Date(this._appService.vendorRegistrationDetails.lutDate));
       
    }

    ngOnInit() {
        this.documentsList = [];
        if (this._appService.vendorRegistrationInitDetails && this._appService.vendorRegistrationInitDetails.documentDetailsList &&
            this._appService.vendorRegistrationInitDetails.documentDetailsList.length > 0) {
            this.documentsList = this._appService.vendorRegistrationInitDetails.documentDetailsList;
        }

        this.vendorDocumentForm = this._formBuilder.group({

            panNum: [null, [Validators.required]],
            gstNum: [null, [Validators.required]],
            pfNum: [null],
            esiNum: [null],
            cinNum: [null],
            isSez: [null],
            isRcmApplicable: [null],
            isMsmedRegistered: [null],
            hasTdsLower: [null],
            lutNum: [null],
            lutDate: [null]

        });

        this._homeService.updateCurrentPageDetails({ pageName: 'venDoc' });
        this.updateVendorDetails();
    }

}
