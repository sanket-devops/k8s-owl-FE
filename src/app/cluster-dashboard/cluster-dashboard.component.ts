import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DashboardService } from '../service/dashboard.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Idashboard, ICluster } from '../interface/Idashboard';
import { ConstantService } from '../service/constant.service';
import { saveAs } from 'file-saver';
import { data, error } from 'jquery';

declare let toastr: any;
toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": false,
  "progressBar": true,
  "positionClass": "toast-top-right",
  "preventDuplicates": true,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "5000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}

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
  // nameSpace: string = 'default';
  clusterName: any = undefined;
  clusterData: any = undefined;
  downloadData: any;
  user:string = "user";
  login = { u: '', p: '', t: '' };
  isChecked = true;
  intervalTime: number = 60;
  intervalId = <any>undefined;
  reloadInterval = <any>undefined;
  timer: number = this.intervalTime;
  loading: boolean = false;
  selectedNamespace: any = {name: 'default', status: 'Active'};
  namespaces: any[] = [];
  isSpinner: any = [];
  followLogs: string[] = [];
  ws: any;

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
  
  removeItemFromisSpinner (index: number) {
    let indexToRemove = index - 1;
    this.isSpinner.splice(indexToRemove, 1);
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

  get isAdmin() {
    return this.login && this.login.t === 'admin';
  }

  get isUser() {
    return this.login && this.login.t === 'user';
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['login']);
  }

  async getCluster(groupId?: string, clusterId?: string, clusterName?: string, podName?: string) {
    let indexOfItem = this.isSpinner.push("GetCluster");
    if (groupId === undefined && clusterId === undefined) {
      this.removeItemFromisSpinner(indexOfItem);
      this.back();
    } else {
      this.clusterData = undefined;
      this.clusterName = clusterName;
      this.podName = podName;
      this.groupId = groupId;
      this.clusterId = clusterId;
      this.title.setTitle(`${clusterName}`);
      try {
        if (this.selectedNamespace) {
          <any>this.dashboardService.getNamespaces('/' + this.groupId, '/' + this.clusterId).subscribe((data: any) => {
            this.namespaces = [];
            data.items.forEach((namespace: any) => {
              this.namespaces.push({name: namespace.metadata.name, status: namespace.status.phase})            
            });
            <any>this.dashboardService.getPods('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name).subscribe((data: any) => {
              this.clusterData = data.items;
              // console.log(this.clusterData);
            });
            this.removeItemFromisSpinner(indexOfItem);
          });
        }
        else {
          this.selectedNamespace = {name: 'default', status: 'Active'};
          <any>this.dashboardService.getPods('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name).subscribe((data: any) => {
            this.clusterData = data.items;
            // console.log(this.clusterData);
            this.removeItemFromisSpinner(indexOfItem);
          });
        }
         
      } catch (e) {
        this.removeItemFromisSpinner(indexOfItem);
        console.log(e);
      }
    }
    return this.clusterData;
  }

  async viewPodLogs(podName: string, appName: string, h?: any) {
    let indexOfItem = this.isSpinner.push(podName + '-' + appName);
    this.podName = podName;
    this.appName = appName
    try {
      if (h) {
        this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + this.podName, '/' + this.appName, '/' + h).subscribe((data: any) => {
          let newWindow = window.open("", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
          let windowData = (data.data).replace(/\n\t/g, '<br />').replace(/\n/g, '<br />');
          newWindow?.document.write(`<p>${windowData}</p>`)
          this.removeItemFromisSpinner(indexOfItem);
        },
        (error) => {
          this.removeItemFromisSpinner(indexOfItem);
          console.log(error);
        })
      } else {
        this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + this.podName, '/' + this.appName).subscribe((data: any) => {
          let newWindow = window.open("", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
          let windowData = (data.data).replace(/\n\t/g, '<br />').replace(/\n/g, '<br />');
          newWindow?.document.write(`<p>${windowData}</p>`)
          this.removeItemFromisSpinner(indexOfItem);
        },
        (error) => {
          this.removeItemFromisSpinner(indexOfItem);
          console.log(error);
        })
      }
    } catch (e) {
      this.removeItemFromisSpinner(indexOfItem);
      console.log(e);
    }
  }

  async downloadPodLogs(podName: string, appName: string, h?: any) {
    let indexOfItem = this.isSpinner.push(podName + '-' + appName);
    this.podName = podName;
    this.appName = appName
    try {
      if (h) {
        let _clusterName = this.clusterName;
        let _podName = this.podName;
        let _appName = this.appName;
        this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + this.podName, '/' + this.appName, '/' + h).subscribe((data: any) => {
          this.downloadData = new File([data.data], `${_clusterName}-${_podName}-${_appName}-(${h}H).log`, { type: 'text/plain' });
          saveAs.saveAs(this.downloadData, `${_clusterName}-${_podName}-${_appName}-(${h}H).log`)
          toastr.success(`Download Started: ${_clusterName}-${_podName}-${_appName}-(${h}H).log`);
          this.removeItemFromisSpinner(indexOfItem);
        },
        (error) => {
          this.removeItemFromisSpinner(indexOfItem);
          console.log(error);
        });
      } else {
        let _clusterName = this.clusterName;
        let _podName = this.podName;
        let _appName = this.appName;
        this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + this.podName, '/' + this.appName).subscribe((data: any) => {
          this.downloadData = new File([data.data], `${_clusterName}-${_podName}-${_appName}.log`, { type: 'text/plain' });
          saveAs.saveAs(this.downloadData, `${this.clusterName}-${this.podName}-${_appName}.log`)
          toastr.success(`Download Started: ${this.clusterName}-${this.podName}-${_appName}.log`);
          this.removeItemFromisSpinner(indexOfItem);
        },
        (error) => {
          this.removeItemFromisSpinner(indexOfItem);
          console.log(error);
        });
      }
    } catch (e) {
      this.removeItemFromisSpinner(indexOfItem);
      console.log(e);
    }
  }

  async viewFollowLog(podName: string, appName: string, tailLines?: any) {
    let indexOfItem = this.isSpinner.push(podName + '-' + appName);
    this.podName = podName;
    this.appName = appName
    try {
      if (typeof(tailLines) === 'number') {
        this.dashboardService.viewFollowLog('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + this.podName, '/' + this.appName, '/' + tailLines).subscribe((data: any) => {
          let newWindow = window.open("", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
  
          this.ws = new window.WebSocket(`${this.constantService.WS_ENDPOINT}/${data.id}`);
          this.ws.onopen = () => {
            console.log("Socket Connected...");
          };
          this.ws.onmessage = (msg: any) => {
            // console.log(msg);
            newWindow?.document.write(`<p>${msg.data}</p>`)
          };
          this.ws.onerror = (e: any) => {
            console.error(e);
          };
  
          this.ws.onclose = (e: any) => {
            console.log("Socket Disconnected...");
          };
  
          this.removeItemFromisSpinner(indexOfItem);
        },
          (error) => {
            this.removeItemFromisSpinner(indexOfItem);
            console.log(error);
          });
      } else if (typeof(tailLines) === 'string') {
        this.dashboardService.viewFollowLog('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + this.podName, '/' + this.appName, '/' + tailLines).subscribe((data: any) => {
  
          this.ws = new window.WebSocket(`${this.constantService.WS_ENDPOINT}/${data.id}/stop`);
          this.ws.onopen = () => {
            console.log("Socket Dissconected...");
          };
          this.ws.onmessage = (msg: any) => {
          };
          this.ws.onerror = (e: any) => {
            console.error(e);
          };
  
          this.ws.onclose = (e: any) => {
            console.log("Socket Disconnected...");
          };
  
          this.removeItemFromisSpinner(indexOfItem);
        },
          (error) => {
            this.removeItemFromisSpinner(indexOfItem);
            console.log(error);
          });
        
      }

    } catch (e) {
      this.removeItemFromisSpinner(indexOfItem);
      console.log(e);
    }
  }

  async viewAppLogs(deploymentName: string, h?: any) {
    let indexOfItem = this.isSpinner.push(deploymentName);
    this.deploymentName = deploymentName;
    try {
      if (h) {
        this.dashboardService.getAppLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + this.deploymentName, '/' + h).subscribe((data: any) => {
          let newWindow = window.open("", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
          data.data.forEach((logs: any) => {
            let windowData = logs.replace(/\n\t/g, '<br />').replace(/\n/g, '<br />');
            newWindow?.document.write(`<p>${windowData}</p>`)
          });
          this.removeItemFromisSpinner(indexOfItem);
        },
        (error) => {
          this.removeItemFromisSpinner(indexOfItem);
          console.log(error);
        })
      } else {
        this.dashboardService.getAppLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + this.deploymentName).subscribe((data: any) => {
          let newWindow = window.open("", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
          data.data.forEach((logs: any) => {
            let windowData = logs.replace(/\n\t/g, '<br />').replace(/\n/g, '<br />');
            newWindow?.document.write(`<p>${windowData}</p>`)
          });
          this.removeItemFromisSpinner(indexOfItem);
        },
        (error) => {
          this.removeItemFromisSpinner(indexOfItem);
          console.log(error);
        })
      }
    } catch (e) {
      this.removeItemFromisSpinner(indexOfItem);
      console.log(e);
    }
  }
  async downloadAppLogs(deploymentName: string, h?: any) {
    let indexOfItem = this.isSpinner.push(deploymentName);
    this.deploymentName = deploymentName;
    try {
      if (h) {
        let _clusterName = this.clusterName;
        let _deploymentName = this.deploymentName;
        this.dashboardService.getAppLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + this.deploymentName, '/' + h).subscribe((data: any) => {
          this.downloadData = new File([data.data], `${_clusterName}-${_deploymentName}-(${h}H).log`, { type: 'text/plain' });
          saveAs.saveAs(this.downloadData, `${_clusterName}-${_deploymentName}-(${h}H).log`)
          toastr.success(`Download Started: ${_clusterName}-${_deploymentName}-(${h}H).log`);
          this.removeItemFromisSpinner(indexOfItem);
        },
        (error) => {
          this.removeItemFromisSpinner(indexOfItem);
          console.log(error);
        })
      } else {
        let _clusterName = this.clusterName;
        let _deploymentName = this.deploymentName;
        this.dashboardService.getAppLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + this.deploymentName).subscribe((data: any) => {
          this.downloadData = new File([data.data], `${_clusterName}-${_deploymentName}-(all).log`, { type: 'text/plain' });
          saveAs.saveAs(this.downloadData, `${_clusterName}-${_deploymentName}-(all).log`)
          toastr.success(`Download Started: ${_clusterName}-${_deploymentName}-(all).log`);
          this.removeItemFromisSpinner(indexOfItem);
        },
        (error) => {
          this.removeItemFromisSpinner(indexOfItem);
          console.log(error);
        })
      }
    } catch (e) {
      this.removeItemFromisSpinner(indexOfItem);
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
      let resp = await this.dashboardService.deletePod('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + this.podName).toPromise();
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
