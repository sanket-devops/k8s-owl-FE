import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DashboardService } from '../service/dashboard.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Idashboard, ICluster } from '../interface/Idashboard';
import { ConstantService } from '../service/constant.service';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnInit {
  intervalId = <any>undefined;
  responseData: any = undefined;
  clusterData: any = undefined;
  clusterName: any = undefined;
  podLogs: any = undefined;
  groupId: any = undefined;
  clusterId: any = undefined;
  podName: any = undefined;
  showPortal: boolean = false;
  clusterCount: number = 1;
  login = { u: '', p: '', t: '' };

  constructor(
    public constantService: ConstantService,
    public dashboardService: DashboardService,
    public router: Router,
    private http: HttpClient,

  ) { }
  async ngOnInit() {
    try {
      this.login = JSON.parse(
        this.constantService.getDecryptedData(localStorage.getItem('token'))
      );
      let isValidUser = this.constantService.isValidUser(this.login);
      if (!isValidUser) return this.logout();
    } catch (error) {
      return this.logout();
    }
    this.getAll();
  }
  get isAdmin() {
    return this.login && this.login.t === 'admin';
  }

  get isUser() {
    return this.login && this.login.t === 'user';
  }

  async getAll() {
    let res = [];
    try {
      res = <any>this.dashboardService.getClusters().subscribe((data: any) => {
        this.responseData = data.data;
        // console.log(this.responseData);
        for (let item = 0; item < this.responseData.length; item++) {
          for (let count = 0; count < this.responseData[item].clusters.length; count++) {
            this.clusterCount = count+count;
            
          }
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
  async getCluster(groupId?: string, clusterId?: string, clusterName?: string, podName?: string) {
    this.clusterData = undefined;
    this.clusterName = clusterName;
    this.groupId = groupId;
    this.clusterId = clusterId;
    let res = [];
    try {
      res = <any>this.dashboardService.getPods('/' + groupId, '/' + clusterId).subscribe((data: any) => {
        // console.log(data);
        this.clusterData = data;
      });
    } catch (e) {
      console.log(e);
    }
  }
  async getPodLogs(podName: string, h?: string) {
    this.podLogs = undefined;
    this.podName = podName;
    let res = [];
    try {
      if (h) {
        this.podLogs = this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.podName, '/' + h);
        window.open(this.podLogs, "", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
      } else {
        this.podLogs = this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.podName);
        window.open(this.podLogs, "", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
      }
    } catch (e) {
      console.log(e);
    }
  }
  async downloadLogs(podName: string, h?: string) {
    this.podLogs = undefined;
    this.podName = podName;
    let res = [];
    try {
      if (h) {
        this.podLogs = this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.podName, '/' + h);
        saveAs.saveAs(this.podLogs, `${this.podName}-(${h}).log`);
      } else {
        this.podLogs = this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.podName);
        saveAs.saveAs(this.podLogs, `${this.podName}.log`);
      }
    } catch (e) {
      console.log(e);
    }
  }

  AddCluster() {
    this.dashboardService.cloneObj = <any>undefined;
    this.dashboardService.editObj = <any>undefined;
    this.router.navigate(['addcluster']);
  }
  editData(item: Idashboard) {
    this.dashboardService.cloneObj = <any>undefined;
    this.dashboardService.editObj = item;
    this.router.navigate(['addcluster']);
  }
  async deleteData(item: Idashboard) {
    if (
      window.confirm(
        `Do you want to delete "Group" : ${item.groupName} ?`
      )
    ) {
      let resp = await this.dashboardService.delete(<any>item._id).toPromise();
      // toastr.success('Item deleted successfully : ' + item.hostName);
      await this.getAll();
    }
  }
  logout() {
    localStorage.clear();
    this.router.navigate(['login']);
  }
  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}

