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
  getClusters() {
    console.log("Dashboard service")
    return this.http.get(this.constantService.get_api_url(this.constantService.API_ENDPOINT),
    )
  }
  getPods(groupId: string, clusterId: string, populate?: string) {
    return this.http.get<Partial<Idashboard>>(this.constantService.get_api_url(this.constantService.API_ENDPOINT + groupId + clusterId + '/pods' + `${populate ? '?populate=' + populate : ''}`));
  }
}
