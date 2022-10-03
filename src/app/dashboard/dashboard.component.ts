import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
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
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnInit {
  @Input()
  
  responseData: any = undefined;
  // clusterData: any = undefined;
  clusterName: any = undefined;
  podLogs: any = undefined;
  groupId: any = undefined;
  clusterId: any = undefined;
  podName: any = undefined;
  appName: any = undefined;
  appLogs: any = undefined;
  showPortal: boolean = false;
  clusterCount: number = 1;
  user:string = "user";
  clusterArr = <any>[];
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
    private title: Title,
    public router: Router,
    private http: HttpClient,

  ) { }
  async ngOnInit() {
    try {
      this.login = JSON.parse(
        this.constantService.getDecryptedData(localStorage.getItem('token'))
      );
      let isValidUser = this.constantService.isValidUser(this.login);
      this.user = this.login.u;
      if (!isValidUser) return this.logout();
    } catch (error) {
      return this.logout();
    }
    this.getAll();

    this.intervalId = setInterval(() => {
      if (this.isChecked) {
        this.timer--;
        $('.timer').text(this.timer);
        if (this.timer === 0) {
          this.loading = true;
          this.getAll();
          this.loading = false;
          toastr.success('Reload Data Successfully!');
          this.timer = this.intervalTime;
        }
      } else {
        toastr.warning('Auto Reload Data Off!');
      }
    }, 1000);
  }
  get isAdmin() {
    return this.login && this.login.t === 'admin';
  }

  get isUser() {
    return this.login && this.login.t === 'user';
  }

  async getAll() {
    this.title.setTitle("k8s-owl");
    let res = [];
    try {
      res = <any>this.dashboardService.getClusters().subscribe((data: any) => {
        this.responseData = data.data;
        // console.log(this.user)
        for (let item = 0; item < this.responseData.length; item++) {
          if (this.user === "admin" || this.user === "user"){
            this.clusterArr = this.responseData
          }else{
            if (this.user === this.responseData[item].groupName){
              this.clusterArr.push(this.responseData[item])
              // console.log(this.responseData[item])
            }
          }
          for (let count = 0; count < this.responseData[item].clusters.length; count++) {
            this.clusterCount = count+count;
          }
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
  
  async autoReload(event?: any) {
    this.isChecked != this.isChecked
  }
  async latestPull(event?: any) {
    // let res = await ConstantService.get_promise(this.dashboardservice.latestPull());
    this.loading = true;
    await this.getAll();
    this.loading = false;
  }

  ClusterDashboard(groupId?: string, clusterId?: string, clusterName?: string, podName?: string) {
    this.dashboardService.groupId = groupId;
    this.dashboardService.clusterId = clusterId;
    this.dashboardService.clusterName = clusterName;
    this.dashboardService.podName = podName;
    // window.open('/clusterdashboard')
    // this.dashboardService.getCluster(groupId, clusterId, clusterName)
    this.router.navigate(['clusterdashboard']);
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
      toastr.success('Item deleted successfully : ' + item.groupName);
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

