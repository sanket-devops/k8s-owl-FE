import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DashboardService } from '../service/dashboard.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Idashboard, ICluster } from '../interface/Idashboard';
import { ConstantService } from '../service/constant.service';
import { saveAs } from 'file-saver';

declare let toastr: any;
declare let $: any;
declare let _: any;

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
  clusterName: any = undefined;
  clusterData: any = undefined;
  login = { u: '', p: '', t: '' };
  isChecked = true;
  intervalTime: number = 60;
  intervalId = <any>undefined;
  reloadInterval = <any>undefined;
  timer: number = this.intervalTime;
  loading: boolean = false;

  constructor(
    public constantService: ConstantService,
    public dashboardService: DashboardService,
    public router: Router,
    private http: HttpClient,
    private title: Title,
  ) {
    
   }

  ngOnInit(): void {
    this.getCluster(this.dashboardService.groupId, this.dashboardService.clusterId, this.dashboardService.clusterName);
    
    this.intervalId = setInterval(() => {
      if (this.isChecked) {
        this.timer--;
        $('.timer').text(this.timer);
        if (this.timer === 0) {
          this.loading = true;
          this.getCluster(this.dashboardService.groupId, this.dashboardService.clusterId, this.dashboardService.clusterName);
          this.loading = false;
          toastr.success('Reload Data Successfully!');
          this.timer = this.intervalTime;
        }
      } else {
        toastr.warning('Auto Reload Data Off!');
      }
    }, 1000);

  }
  back() {
    this.router.navigate(['dashboard']);
  }
  
  get isAdmin() {
    return this.login && this.login.t === 'admin';
  }

  get isUser() {
    return this.login && this.login.t === 'user';
  }

  async getCluster(groupId?: string, clusterId?: string, clusterName?: string, podName?: string) {
    this.clusterData = undefined;
    this.clusterName = clusterName;
    this.podName = podName;
    this.groupId = groupId;
    this.clusterId = clusterId;
    this.title.setTitle(`${clusterName}`);
    let res = [];
    try {
      res = <any>this.dashboardService.getPods('/' + this.groupId, '/' + this.clusterId).subscribe((data: any) => {
        this.clusterData = data;
      });
    } catch (e) {
      console.log(e);
    }
    return this.clusterData;
  }
  async viewPodLogs(podName: string, h?: string) {
    this.podLogs = undefined;
    this.podName = podName;
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
  async downloadPodLogs(podName: string, h?: string) {
    this.podLogs = undefined;
    this.podName = podName;
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
  async viewAppLogs(appName: string, lines?: string) {
    this.appLogs = undefined;
    this.appName = appName;
    try {
      if (lines) {
        this.appLogs = this.dashboardService.getAppLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.appName, '/' + lines);
        window.open(this.appLogs, "", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
      } else {
        this.appLogs = this.dashboardService.getAppLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.appName);
        window.open(this.appLogs, "", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
      }
    } catch (e) {
      console.log(e);
    }
  }
  async downloadAppLogs(appName: string, lines?: string) {
    this.appLogs = undefined;
    this.appName = appName;
    try {
      if (lines) {
        this.appLogs = this.dashboardService.getAppLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.appName, '/' + lines);
        saveAs.saveAs(this.appLogs, `${this.appName}-(lines=${lines}).log`);
      } else {
        this.appLogs = this.dashboardService.getAppLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.appName);
        saveAs.saveAs(this.appLogs, `${this.appName}.log`);
      }
    } catch (e) {
      console.log(e);
    }
  }
  async deletePod(podName: string) {
    this.podName = podName;
    if (
      window.confirm(
        `Do you want to delete "Pod" : ${this.podName} ?`
      )
    ) {
      let resp = await this.dashboardService.deletePod('/' + this.groupId, '/' + this.clusterId, '/' + this.podName).toPromise();
      toastr.success(resp) && await this.latestPull();
    }
  }

  async autoReload(event?: any) {
    this.isChecked != this.isChecked
  }

  async latestPull(event?: any) {
    this.loading = true;
    await this.getCluster(this.dashboardService.groupId, this.dashboardService.clusterId, this.dashboardService.clusterName);
    this.loading = false;
  }

}
