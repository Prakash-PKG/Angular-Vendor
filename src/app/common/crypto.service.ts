import {Injectable} from "@angular/core";
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root'
})

export class CryptoService{
    private _key = "1234567890";
    private _vendorKey ="marlabs$#&@";

    constructor(){}

    encrypt(usercreds) {
        let encrypted = CryptoJS.AES.encrypt(usercreds, this._key);
        return encrypted.toString();
    }
    encryptVendorPassword(usercreds) {
        let encrypted = CryptoJS.AES.encrypt(usercreds, this._vendorKey);
        return encrypted.toString();
    }

    decrypt(usercreds) {
        let decrypted = CryptoJS.AES.decrypt(usercreds.toString(), this._key);
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
}