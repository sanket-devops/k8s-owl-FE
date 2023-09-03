import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import { Observable } from 'rxjs';

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
  getPodMetrics(groupId: string, clusterId: string, nameSpace?: string, populate?: string) {
    return this.http.get(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/metrics' + groupId + clusterId + nameSpace + '/pods' + `${populate ? '?populate=' + populate : ''}`));
  }
  getNodeMetrics(groupId: string, clusterId: string, populate?: string) {
    return this.http.get(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/metrics' + groupId + clusterId + '/nodes' + `${populate ? '?populate=' + populate : ''}`));
  }

  getPodsLogs(groupId: string, clusterId: string, namespace: string, podName: string, appName: string, h?: any): Observable<any> {
    if (h) {
      return this.http.get<any>(this.constantService.get_api_url(this.constantService.API_ENDPOINT + groupId + clusterId + namespace + podName + appName + h));
    } else {
      return this.http.get<any>(this.constantService.get_api_url(this.constantService.API_ENDPOINT + groupId + clusterId + namespace + podName + appName));
    }
  }
  getPodsPreviousLogs(groupId: string, clusterId: string, namespace: string, podName: string, appName: string): Observable<any> {
    return this.http.get<any>(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/previous' + groupId + clusterId + namespace + podName + appName));
  }

  viewFollowLog(groupId: string, clusterId: string, namespace: string, podName: string, appName: string, tailLines?: any): Observable<string>  {
    if (tailLines) {
      return this.http.get<any>(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/follow' + groupId + clusterId + namespace + podName + appName + tailLines));
    } else {
      return this.http.get<any>(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/follow' + groupId + clusterId + namespace + podName + appName));
    }
  }

  deletePod(groupId: string, clusterId: string, namespace: string, podName: string, populate?: string) {
    return this.http.delete(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/DeletePod' + groupId + clusterId + namespace + podName + `${populate ? '?populate=' + populate : ''}`));
  }

  rolloutRestart(groupId: string, clusterId: string, namespace: string, deploymentName: string, populate?: string) {
    return this.http.get(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/restart' + groupId + clusterId + namespace + deploymentName + `${populate ? '?populate=' + populate : ''}`));
  }

  getDeploymentManifest(groupId: string, clusterId: string, namespace: string, deploymentName: string, populate?: string): Observable<any> {
    return this.http.get(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/manifest' + groupId + clusterId + namespace + deploymentName + `${populate ? '?populate=' + populate : ''}`));
  }

  updateDeploymentManifest(data: any): Observable<any> {
    return this.http.post<any>(this.constantService.get_api_url(this.constantService.API_ENDPOINT + '/cluster/deployment/update-deployment'), data);
  }

}
