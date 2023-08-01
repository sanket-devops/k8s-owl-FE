import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DashboardService } from '../service/dashboard.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Idashboard, ICluster } from '../interface/Idashboard';
import { ConstantService } from '../service/constant.service';
import { saveAs } from 'file-saver';
import { data, error } from 'jquery';

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
  deploymentName: any = undefined;
  groupId: any = undefined;
  clusterId: any = undefined;
  nameSpace: string = 'default';
  clusterName: any = undefined;
  clusterData: any = undefined;
  login = { u: '', p: '', t: '' };
  isChecked = true;
  intervalTime: number = 60;
  intervalId = <any>undefined;
  reloadInterval = <any>undefined;
  timer: number = this.intervalTime;
  loading: boolean = false;

  selectedApp: Idashboard[] = <any>undefined;

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

  calculateAge(createdDate: any) {
    const options: any = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      // second: 'numeric',
      hour12: true,
      // timeZoneName: 'short'
    };
  
    const localDate = new Date(createdDate);
    const localTimeString = localDate.toLocaleString(undefined, options);
  
    return localTimeString;
  }

  back() {
    this.router.navigate(['dashboard']);
  }

  isAdmin() {
    return this.login && this.login.t === 'admin';
  }

  isUser() {
    return this.login && this.login.t === 'user';
  }

  async getCluster(groupId?: string, clusterId?: string, clusterName?: string, podName?: string) {
    if (groupId === undefined && clusterId === undefined) {
      this.back();
    } else {
      this.clusterData = undefined;
      this.clusterName = clusterName;
      this.podName = podName;
      this.groupId = groupId;
      this.clusterId = clusterId;
      this.title.setTitle(`${clusterName}`);
      let res = [];
      try {
        res = <any>this.dashboardService.getPods('/' + this.groupId, '/' + this.clusterId, '/' + this.nameSpace).subscribe((data: any) => {
          this.clusterData = data.items;
          console.log(this.clusterData);
        });
      } catch (e) {
        console.log(e);
      }
    }
    return this.clusterData;
  }

  async viewPodLogs(podName: string, appName: string, h?: any) {
    this.podName = podName;
    this.appName = appName
    try {
      if (h) {
        this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.nameSpace, '/' + this.podName, '/' + this.appName, '/' + h).subscribe((data: any) => {
          let newWindow = window.open("", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
          let windowData = (data.data).replace(/\n\t/g, '<br />').replace(/\n/g, '<br />');
          newWindow?.document.write(`<p>${windowData}</p>`)
        },
        (error) => {
          console.log(error);
        })
      } else {
        this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.nameSpace, '/' + this.podName, '/' + this.appName).subscribe((data: any) => {
          let newWindow = window.open("", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
          let windowData = (data.data).replace(/\n\t/g, '<br />').replace(/\n/g, '<br />');
          newWindow?.document.write(`<p>${windowData}</p>`)
        },
        (error) => {
          console.log(error);
        })
      }
    } catch (e) {
      console.log(e);
    }
  }

  async downloadPodLogs(podName: string, appName: string, h?: any) {
    this.podName = podName;
    this.appName = appName
    try {
      if (h) {
        this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.nameSpace, '/' + this.podName, '/' + this.appName, '/' + h).subscribe((data: any) => {
          let downloadData = new Blob([data.data], { type: 'text/plain' });
          saveAs.saveAs(downloadData, `${this.clusterName}-${this.podName}-(${h}H).log`)
        },
        (error) => {
          console.log(error);
        });
      } else {
        this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.nameSpace, '/' + this.podName, '/' + this.appName).subscribe((data: any) => {
          let downloadData = new Blob([data.data], { type: 'text/plain' });
          saveAs.saveAs(downloadData, `${this.clusterName}-${this.podName}.log`)
        },
        (error) => {
          console.log(error);
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  async viewAppLogs(deploymentName: string, h?: any) {
    this.deploymentName = deploymentName;
    try {
      if (h) {
        this.dashboardService.getAppLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.nameSpace, '/' + this.deploymentName, '/' + h).subscribe((data: any) => {
          let newWindow = window.open("", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
          data.data.forEach((logs: any) => {
            let windowData = logs.replace(/\n\t/g, '<br />').replace(/\n/g, '<br />');
            newWindow?.document.write(`<p>${windowData}</p>`)
          });
        },
        (error) => {
          console.log(error);
        })
      } else {
        this.dashboardService.getAppLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.nameSpace, '/' + this.deploymentName).subscribe((data: any) => {
          let newWindow = window.open("", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
          data.data.forEach((logs: any) => {
            let windowData = logs.replace(/\n\t/g, '<br />').replace(/\n/g, '<br />');
            newWindow?.document.write(`<p>${windowData}</p>`)
          });
        },
        (error) => {
          console.log(error);
        })
      }
    } catch (e) {
      console.log(e);
    }
  }
  async downloadAppLogs(deploymentName: string, h?: any) {
    this.deploymentName = deploymentName;
    try {
      if (h) {
        this.dashboardService.getAppLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.nameSpace, '/' + this.deploymentName, '/' + h).subscribe((data: any) => {
          let readydtoDwnloadData = new Blob([data.data], { type: 'text/plain' });
          saveAs.saveAs(readydtoDwnloadData, `${this.clusterName}-${this.deploymentName}-(${h}H).log`)
        },
        (error) => {
          console.log(error);
        })
      } else {
        this.dashboardService.getAppLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.nameSpace, '/' + this.deploymentName).subscribe((data: any) => {
          let readydtoDwnloadData = new Blob([data.data], { type: 'text/plain' });
          saveAs.saveAs(readydtoDwnloadData, `${this.clusterName}-${this.deploymentName}-(all).log`)
        },
        (error) => {
          console.log(error);
        })
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
  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

}
