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
    return this.http.get(this.constantService.get_api_url(this.constantService.API_ENDPOINT),
    )
  }
  getPods(groupId: string, clusterId: string, populate?: string) {
    return this.http.get<Partial<Idashboard>>(this.constantService.get_api_url(this.constantService.API_ENDPOINT + groupId + clusterId + '/pods' + `${populate ? '?populate=' + populate : ''}`));
  }

  async getCluster(groupId?: string, clusterId?: string, clusterName?: string, podName?: string) {
    this.clusterData = undefined;
    this.clusterName = clusterName;
    this.groupId = groupId;
    this.clusterId = clusterId;
    let res = [];
    // console.log(groupId , clusterId)
    try {
      res = <any>this.getPods('/' + this.groupId, '/' + this.clusterId).subscribe((data: any) => {
        // console.log(data);
        // console.log(groupId , clusterId);
        this.clusterData = data;
      });
    } catch (e) {
      console.log(e);
    }
    return this.clusterData;
  }

  getPodsLogs(groupId: string, clusterId: string, podName: string, h?: string, populate?: string) {
    let urlLog;
    if (h) {
      urlLog = this.constantService.API_ENDPOINT + groupId + clusterId + podName + h;
    } else {
      urlLog = this.constantService.API_ENDPOINT + groupId + clusterId + podName;
    }
    // console.log(url);
    // return this.http.get(this.constantService.API_ENDPOINT + groupId + clusterId + podName + `${populate ? '?populate=' + populate : ''}`, {responseType: 'text'});
    return urlLog;
  }
  getAppLogs(groupId: string, clusterId: string, appName: string, lines?: string, populate?: string) {
    let urlAppLog;
    if (lines) {
      urlAppLog = this.constantService.API_ENDPOINT + groupId + clusterId + appName + lines + '/AppLogs';
    } else {
      urlAppLog = this.constantService.API_ENDPOINT + groupId + clusterId + appName + '/AppLogs';
    }
    return urlAppLog;
  }
}
