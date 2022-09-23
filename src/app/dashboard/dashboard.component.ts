import { Component, OnInit } from '@angular/core';
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
  responseData: any = undefined;
  clusterData: any = undefined;
  clusterName: any = undefined;
  podLogs: any = undefined;
  groupId: any = undefined;
  clusterId: any = undefined;
  podName: any = undefined;
  showPortal: boolean = false;

  constructor(
    public constantService: ConstantService,
    public dashboardService: DashboardService,
    public router: Router,
    private http: HttpClient,

  ) { }
  async ngOnInit() {
    this.getAll();

  }
  async getAll() {
    let res = [];
    try {
      res = <any>this.dashboardService.getClusters().subscribe((data: any) => {
        this.responseData = data.data;
        // console.log(this.responseData);
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
  async getPodLogs(podName: string) {
    this.podLogs = undefined;
    this.podName = podName;
    let res = [];
    try {
        this.podLogs = this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.podName);
        window.open(this.podLogs, "", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
    } catch (e) {
      console.log(e);
    }
  }
  async downloadLogs(podName: string) {
    this.podLogs = undefined;
    this.podName = podName;
    let res = [];
    try {
        this.podLogs = this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.podName);
        saveAs.saveAs(this.podLogs, `${this.podName}.log`);
    } catch (e) {
      console.log(e);
    }
  }

  AddCluster() {
    this.dashboardService.cloneObj = <any>undefined;
    this.dashboardService.editObj = <any>undefined;
    this.router.navigate(['addcluster']);
  }
}

