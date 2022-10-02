import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';

declare let moment: any;
declare let CryptoJS: any;

@Injectable()
export class ConstantService {
  API_ENDPOINT: string = environment.API_BASE_URL + '/clusters';
  DATE_FORMAT_MONGODB: string = 'YYYY-MM-DDTHH:mm:SS.000Z';
  DATE_FORMAT_USER: string = 'DD-MM-YYYY';
  DATETIME_FORMAT_USER: string = 'DD-MM-YYYY H:mm A';
  k = '\x6A\x40\x6D\x65\x73\x62\x6F\x6E\x64';

  vu = [
    {u: 'admin', p: 'Nimda$2022%letaP', t: 'admin'},
    {u: 'user', p: 'Resu$2022%nooS', t: 'user'},
    {u: 'operr-v3', p: 'Rrepo$2022%3V', t: 'user'},
    {u: 'bynfor-v3', p: 'Rofnyb$2022%3V', t: 'user'},
    {u: 'parking-v2', p: 'Gnikrap$2022%2V', t: 'user'},

  ];


  get_api_url(url: string): string {
    // console.log(url, ' url');
    return url;
    // let _0x54d2 = ['\x4D\x40\x79\x75\x72\x32\x37\x35\x32\x34\x35\x31\x31'];
    // let p = _0x54d2[0];
    // let return_url = '';
    // let temp_url = url;
    // if (temp_url.startsWith(environment.API_BASE_URL)) {
    //   temp_url = temp_url.replace(environment.API_BASE_URL, '');
    //   temp_url = `@@@${moment().utcOffset(+330).toDate().getTime()}@@@${temp_url}`;
    //   return_url = CryptoJS.AES.encrypt(temp_url, p).toString();
    //   return_url = environment.API_BASE_URL + '/$/' + return_url;
    // } else {
    //   temp_url = `@@@${moment().utcOffset(+330).toDate().getTime()}@@@${temp_url}`;
    //   return_url = CryptoJS.AES.encrypt(temp_url, p).toString();
    //   return_url = '/$/' + return_url;
    // }
    // return return_url;
  }

  isValidUser(data: any) {
    for (let item of this.vu) {
      if (item.u === data.u && item.p === data.p) return true;
    }
    return false;
  }

  getEncryptedData(data: any) {
    let encryptMe;
    if (typeof data === 'object') encryptMe = JSON.stringify(data);
    else if (typeof data === 'string') encryptMe = data;
    else throw new Error('Invalid data sent');
    return CryptoJS.AES.encrypt(encryptMe, this.k).toString();
  }

  getDecryptedData(data: any) {
    let bytes = CryptoJS.AES.decrypt(data, this.k);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  public static get_promise(observable: Observable<any>): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      observable.subscribe((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }
}
