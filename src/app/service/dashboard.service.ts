import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {ConstantService} from './constant.service';
// import {CookieService} from 'ngx-cookie-service';
import {Idashboard} from '../interface/Idashboard';

@Injectable()
export class DashboardService {
  // API_ENDPOINT: string = environment.API_BASE_URL + '/clusters/';
  cloneObj: Idashboard = <any>undefined;
  editObj: Idashboard = <any>undefined;
  constructor(private http: HttpClient, public constantService: ConstantService) {
  }

  save(data: Partial<Idashboard>) {
    return this.http.post(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/cluster-save'), {
      data: data
    });
  }
  update(data: Partial<Idashboard>) {
    return this.http.put(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/update'),
      {
        data: data,
        id: data._id,
      }
    );
  }
  delete(_id: string) {
    return this.http.post(this.constantService.get_api_url(this.constantService.API_ENDPOINT + `/cluster-delete`), {data: _id});
  }
  getClusters() {
    console.log("Dashboard service")
    return this.http.get(this.constantService.get_api_url(this.constantService.API_ENDPOINT),
    )
  }
  getPods(groupId: string, clusterId: string, populate?: string) {
    return this.http.get<Partial<Idashboard>>(this.constantService.get_api_url(this.constantService.API_ENDPOINT + groupId + clusterId + '/pods' + `${populate ? '?populate=' + populate : ''}`));
  }
  getPodsLogs48H(groupId: string, clusterId: string, podName: string, populate?: string) {
    let urlLog = this.constantService.API_ENDPOINT + groupId + clusterId + podName + '/48H';
    // console.log(url);
    // return this.http.get(this.constantService.API_ENDPOINT + groupId + clusterId + podName + `${populate ? '?populate=' + populate : ''}`, {responseType: 'text'});
    return urlLog;


  }
  getPodsLogs72H(groupId: string, clusterId: string, podName: string, populate?: string) {
    let urlLog = this.constantService.API_ENDPOINT + groupId + clusterId + podName + '/72H';
    // console.log(url);
    // return this.http.get(this.constantService.API_ENDPOINT + groupId + clusterId + podName + `${populate ? '?populate=' + populate : ''}`, {responseType: 'text'});
    return urlLog;


  }
}
