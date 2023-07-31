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
  clusterName: any = undefined;
  groupId: any = undefined;
  clusterId: any = undefined;
  clusterData: any = undefined;
  podName: any = undefined;

  constructor(private http: HttpClient, public constantService: ConstantService) {
  }

  save(data: Partial<Idashboard>) {
    return this.http.post(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/cluster-save'), {
      data: this.constantService.getEncryptedData(data)
    });
  }
  update(data: Partial<Idashboard>) {
    return this.http.put(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/update'),
      {
        data: this.constantService.getEncryptedData(data),
        id: this.constantService.getEncryptedData(data._id),
      }
    );
  }
  delete(_id: string) {
    return this.http.post(this.constantService.get_api_url(this.constantService.API_ENDPOINT + `/cluster-delete`), {data: _id});
  }
  async getClusters() {
    let resp = <any>await this.http.get(this.constantService.get_api_url(this.constantService.API_ENDPOINT)).toPromise();
    return JSON.parse(this.constantService.getDecryptedData(resp.data));
  }
  getPods(groupId: string, clusterId: string, nameSpace?: string, populate?: string) {
    let namespace = 'default';
    // return this.http.get(this.constantService.get_api_url(this.constantService.API_ENDPOINT + groupId + clusterId + '/pods' + `${populate ? '?populate=' + populate : ''}`));
    return this.http.get(this.constantService.get_api_url(this.constantService.API_ENDPOINT + groupId + clusterId + `/${namespace}` + '/pods' + `${populate ? '?populate=' + populate : ''}`));
  }

  getPodsLogs(groupId: string, clusterId: string, podName: string, appName: string, h?: string, populate?: string) {
    let urlLog;
    if (h) {
      urlLog = this.constantService.API_ENDPOINT + groupId + clusterId + podName + appName + h;
    } else {
      urlLog = this.constantService.API_ENDPOINT + groupId + clusterId + podName + appName;
    }
    // console.log(url);
    // return this.http.get(this.constantService.API_ENDPOINT + groupId + clusterId + podName + `${populate ? '?populate=' + populate : ''}`, {responseType: 'text'});
    return urlLog;
  }
  getAppLogs(groupId: string, clusterId: string, deploymentName: string, appName: string, lines?: string, populate?: string) {
    let urlAppLog;
    if (lines) {
      urlAppLog = this.constantService.API_ENDPOINT + groupId + clusterId + deploymentName + appName + lines + '/AppLogs';
    } else {
      urlAppLog = this.constantService.API_ENDPOINT + groupId + clusterId + deploymentName + appName + '/AppLogs';
    }
    return urlAppLog;
  }
  deletePod(groupId: string, clusterId: string, podName: string, populate?: string) {
    return this.http.delete(this.constantService.get_api_url(this.constantService.API_ENDPOINT + groupId + clusterId + podName + '/deletePod' + `${populate ? '?populate=' + populate : ''}`));
  }
}
