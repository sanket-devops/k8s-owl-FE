import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import { Observable, observable } from 'rxjs';

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
  getNamespaces(groupId: string, clusterId: string, populate?: string) {
    return this.http.get(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/namespaces' + groupId + clusterId + `${populate ? '?populate=' + populate : ''}`));
  }

  getPods(groupId: string, clusterId: string, nameSpace?: string, populate?: string) {
    return this.http.get(this.constantService.get_api_url(this.constantService.API_ENDPOINT + groupId + clusterId + nameSpace + '/pods' + `${populate ? '?populate=' + populate : ''}`));
  }

  getPodsLogs(groupId: string, clusterId: string, namespace: string, podName: string, appName: string, h?: any): Observable<any> {
    if (h) {
      return this.http.get<any>(this.constantService.get_api_url(this.constantService.API_ENDPOINT + groupId + clusterId + namespace + podName + appName + h));
    } else {
      return this.http.get<any>(this.constantService.get_api_url(this.constantService.API_ENDPOINT + groupId + clusterId + namespace + podName + appName));
    }
  }

  viewFollowLog(groupId: string, clusterId: string, namespace: string, podName: string, appName: string, tailLines?: any): Observable<string>  {
    if (tailLines) {
      // const httpOptions = {
      //   headers: new HttpHeaders({
      //     'Accept': 'text/plain, */*',
      //     'Content-Type': 'application/json' // We send JSON
      //   }),
      //   responseType: 'text' as 'json'  // We accept plain text as response.
      // };
      return this.http.get<any>(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/follow' + groupId + clusterId + namespace + podName + appName + tailLines));
    } else {
      return this.http.get<any>(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/follow' + groupId + clusterId + namespace + podName + appName));
    }
  }

  getAppLogs(groupId: string, clusterId: string, namespace: string, deploymentName: string, h?: any): Observable<any> {
    if (h) {
      return this.http.get<any>(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/HourlyLog' + groupId + clusterId + namespace + deploymentName + h));
    } else {
      return this.http.get<any>(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/HourlyLog' + groupId + clusterId + namespace + deploymentName));
    }
  }

  deletePod(groupId: string, clusterId: string, namespace: string, podName: string, populate?: string) {
    return this.http.delete(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/DeletePod' + groupId + clusterId + namespace + podName + `${populate ? '?populate=' + populate : ''}`));
  }

}
