import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../service/dashboard.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Idashboard, ICluster } from '../interface/Idashboard';
import { ConstantService } from '../service/constant.service';
import { saveAs } from 'file-saver';
// import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-cluster-dashboard',
  templateUrl: './cluster-dashboard.component.html',
  styleUrls: ['./cluster-dashboard.component.scss']
})
export class ClusterDashboardComponent implements OnInit {
  appLogs: any = undefined;
  appName: any = undefined;
  podLogs: any = undefined;
  podName: any = undefined;
  groupId: any = undefined;
  clusterId: any = undefined;

  login = { u: '', p: '', t: '' };

  constructor(
    public constantService: ConstantService,
    public dashboardService: DashboardService,
    public router: Router,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.dashboardService.getCluster(this.dashboardService.groupId, this.dashboardService.clusterId, this.dashboardService.clusterName);
    this.groupId = this.dashboardService.groupId;
    this.clusterId = this.dashboardService.clusterId;
    console.log(this.groupId, this.clusterId);
  }
  back() {
    this.router.navigate(['dashboard']);
  }
  getClusterData() {
    
  }
  get isAdmin() {
    return this.login && this.login.t === 'admin';
  }

  get isUser() {
    return this.login && this.login.t === 'user';
  }

  async viewPodLogs(podName: string, h?: string) {
    this.podLogs = undefined;
    this.podName = podName;
    let res = [];
    try {
      if (h) {
        this.podLogs = this.dashboardService.getPodsLogs('/' + this.dashboardService.groupId, '/' + this.dashboardService.clusterId, '/' + this.podName, '/' + h);
        window.open(this.podLogs, "", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
      } else {
        this.podLogs = this.dashboardService.getPodsLogs('/' + this.dashboardService.groupId, '/' + this.dashboardService.clusterId, '/' + this.podName);
        window.open(this.podLogs, "", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
      }
    } catch (e) {
      console.log(e);
    }
  }
  async downloadPodLogs(podName: string, h?: string) {
    this.podLogs = undefined;
    this.podName = podName;
    let res = [];
    try {
      if (h) {
        this.podLogs = this.dashboardService.getPodsLogs('/' + this.dashboardService.groupId, '/' + this.dashboardService.clusterId, '/' + this.podName, '/' + h);
        saveAs.saveAs(this.podLogs, `${this.podName}-(${h}).log`);
      } else {
        this.podLogs = this.dashboardService.getPodsLogs('/' + this.dashboardService.groupId, '/' + this.dashboardService.clusterId, '/' + this.podName);
        saveAs.saveAs(this.podLogs, `${this.podName}.log`);
      }
    } catch (e) {
      console.log(e);
    }
  }
  async viewAppLogs(appName: string, lines?: string) {
    this.appLogs = undefined;
    this.appName = appName;
    let res = [];
    try {
      if (lines) {
        this.appLogs = this.dashboardService.getAppLogs('/' + this.dashboardService.groupId, '/' + this.dashboardService.clusterId, '/' + this.appName, '/' + lines);
        window.open(this.appLogs, "", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
      } else {
        this.appLogs = this.dashboardService.getAppLogs('/' + this.dashboardService.groupId, '/' + this.dashboardService.clusterId, '/' + this.appName);
        window.open(this.appLogs, "", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
      }
    } catch (e) {
      console.log(e);
    }
  }
  async downloadAppLogs(appName: string, lines?: string) {
    this.appLogs = undefined;
    this.appName = appName;
    let res = [];
    try {
      if (lines) {
        this.appLogs = this.dashboardService.getAppLogs('/' + this.dashboardService.groupId, '/' + this.dashboardService.clusterId, '/' + this.appName, '/' + lines);
        saveAs.saveAs(this.appLogs, `${this.appName}-(lines=${lines}).log`);
      } else {
        this.appLogs = this.dashboardService.getAppLogs('/' + this.dashboardService.groupId, '/' + this.dashboardService.clusterId, '/' + this.appName);
        saveAs.saveAs(this.appLogs, `${this.appName}.log`);
      }
    } catch (e) {
      console.log(e);
    }
  }

}
