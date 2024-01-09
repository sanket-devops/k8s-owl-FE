import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DashboardService } from '../service/dashboard.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Idashboard, ICluster } from '../interface/Idashboard';
import { ConstantService } from '../service/constant.service';
import { saveAs } from 'file-saver';
import { data, error, event } from 'jquery';
import { JsonPipe } from '@angular/common';
import { from, zip } from 'rxjs';

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
  nodeMetricsData: any = undefined;
  nodesData: any = undefined;
  podsData: any = undefined;
  servicesData: any = undefined;
  clusterActiveIndex: number = 0;
  downloadData: any;
  user:string = "user";
  login = { u: '', p: '', t: '' };
  isChecked = true;
  intervalTime: number = 10;
  intervalId = <any>undefined;
  reloadInterval = <any>undefined;
  timer: number = this.intervalTime;
  percentage: any;
  loading: boolean = false;
  selectedNamespace: any = {name: 'default', status: 'Active'};
  namespaces: any[] = [];
  isSpinner: any = [];
  followLogs: string = '';
  ws: any;
  followLogModal: boolean = false;
  selectedPod: any = <any>undefined;
  selectedContainer: any = <any>undefined;
  selectedApp: Idashboard[] = <any>undefined;
  manifestDialog: boolean = false;
  deploymentManifest: any = undefined;
  updatedDeploymentManifest: any = undefined;
  nodeMetricsMixData: any = undefined;
  selectedPods: any[] = [];
  selectedServices: any[] = [];
  selectedNodes: any[] = [];

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
    this.getNamespaces(this.dashboardService.groupId, this.dashboardService.clusterId, this.dashboardService.clusterName);
    setTimeout(async () => {
      await this.getCluster(this.dashboardService.groupId, this.dashboardService.clusterId, this.dashboardService.clusterName);
    }, 50);

    this.intervalId = setInterval(() => {
      if (Math.sign(this.timer) === -1 || Math.sign(this.timer) === 0) {
        this.timer = 1;
        this.percentage = Math.round((this.timer / this.intervalTime) * 100);
      }
      if (this.isChecked) {
        this.timer--;
        this.percentage = Math.round((this.timer / this.intervalTime) * 100);
        $('.timer').text(this.timer);
        if (this.timer === 0) {
          this.loading = true;
          this.getCluster(this.dashboardService.groupId, this.dashboardService.clusterId, this.dashboardService.clusterName);
          this.loading = false;
          toastr.success('Reload Data Successfully!');
          this.timer = this.intervalTime;
          this.percentage = Math.round((this.timer / this.intervalTime) * 100);
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
  calculateRunningPod(pod: any) {
    let totalContainers: number = pod.spec.containers.length
    if (pod.status.containerStatuses) {
      let readyContainers: number = 0;
      pod.status.containerStatuses.forEach((container: any) => {
        if (container.ready) readyContainers = readyContainers + 1;
      });
      return `${readyContainers}/${totalContainers}`;
    }
    else return `0/${totalContainers}`;
  }
  isPodReady(pod: any) {
    let totalContainers: number = pod.spec.containers.length
    if (pod.status.containerStatuses) {
      let readyContainers: number = 0;
      pod.status.containerStatuses.forEach((container: any) => {
        if (container.ready) readyContainers = readyContainers + 1;
      });
      if (totalContainers === readyContainers) {
        return true;
      }
      else return false;
    }
    else return false;
  }

  calculateMetrics(metrics: any) {
    if (metrics) {
      let matches = metrics.match(/^(\d+)([A-Za-z]+)$/);
  
      if (matches) {
        let numberPart = matches[1];
        let stringPart = matches[2];
        // console.log("Number:", numberPart); // Output: Number: 57320
        // console.log("String:", stringPart); // Output: String: Ki
        if (stringPart === "Mi") {
          numberPart = numberPart * 1024;
          return numberPart;
        } else if (stringPart === "Gi") {
          numberPart = numberPart * 1024 * 1024;
          return numberPart;
        } else if (stringPart === "n") {
          numberPart = numberPart / 1000000000;
          return numberPart;
        } else {
          return numberPart;
        }
      } else {
        // console.log("Invalid format");
        return 0;
      }
    } else {
      return NaN;
    }
  }

  setToFixed(value: any) {
    if (typeof(value) === "number") {
      return value.toFixed(2);
    } else {
      return NaN;
    }
  }

  showFollowLogDialog() {
    this.followLogModal = true;
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

  clear(table: any) {
    table.clear();
}
async getNamespaces(groupId?: string, clusterId?: string, clusterName?: string, podName?: string) {
  if (groupId === undefined && clusterId === undefined) {
    this.back();
  } else {
    this.clusterName = clusterName;
    this.podName = podName;
    this.groupId = groupId;
    this.clusterId = clusterId;
    <any>this.dashboardService.getNamespaces('/' + this.groupId, '/' + this.clusterId).subscribe((data: any) => {
      this.namespaces = [];
      data.items.forEach((namespace: any) => {
        this.namespaces.push({ name: namespace.metadata.name, status: namespace.status.phase })
      });
    });
  }
}

  async getCluster(groupId?: string, clusterId?: string, clusterName?: string, podName?: string) {
    // let indexOfItem = this.isSpinner.push("GetCluster");
    if (groupId === undefined && clusterId === undefined) {
      // this.removeItemFromisSpinner(indexOfItem);
      this.back();
    } else {
      this.clusterName = clusterName;
      this.podName = podName;
      this.groupId = groupId;
      this.clusterId = clusterId;
      this.title.setTitle(`${clusterName}`);
      try {
        if (this.selectedNamespace) {
          switch (this.clusterActiveIndex) {
            case 0:
              <any>this.dashboardService.getPods('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name).subscribe((data: any) => {
                this.podsData = data.items;
                // console.log(data.items);
              },
                (err: any) => {
                  // this.removeItemFromisSpinner(indexOfItem);
                },
                () => {
                  // this.removeItemFromisSpinner(indexOfItem);
                });
              break;
            case 1:
              <any>this.dashboardService.getServices('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name).subscribe((data: any) => {
                this.servicesData = data.items;
                // console.log(this.servicesData);
              },
                (err: any) => {
                  // this.removeItemFromisSpinner(indexOfItem);
                },
                () => {
                  // this.removeItemFromisSpinner(indexOfItem);
                });
              break;
            case 2:
              <any>this.dashboardService.getNodes('/' + this.groupId, '/' + this.clusterId).subscribe((data: any) => {
                this.nodeMetricsMixData = data.items;
                // console.log(this.nodesData);
              },
                (err: any) => {
                  // this.removeItemFromisSpinner(indexOfItem);
                },
                () => {
                  // this.removeItemFromisSpinner(indexOfItem);
                });
              break;

            default:
              break;
          }
        }
        else {
          try {
            this.selectedNamespace = { name: 'default', status: 'Active' };
            <any>this.dashboardService.getPods('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name).subscribe((data: any) => {
              this.podsData = data.items;
              // console.log(this.clusterData);
              // this.removeItemFromisSpinner(indexOfItem);
            });
          } catch (error) {
            // this.removeItemFromisSpinner(indexOfItem);
          }
        }
      } catch (e) {
        // this.removeItemFromisSpinner(indexOfItem);
        console.log(e);
      }
    }
    return this.podsData;
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
    this.appName = appName;

    let winHtml = `
    <!DOCTYPE html>
    <html>
        <head>
            <title>${this.podName} / ${this.appName}</title>
        </head>
        <body>
        </body>
    </html>`;

    let winUrl = URL.createObjectURL(
      new Blob([winHtml], { type: 'text/html' })
    );

    let newWindow = window.open(winUrl, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");

    setInterval(() => {
      if (newWindow?.document.body.offsetHeight) {
        let threshold = 5000;
        let verticalScroll = newWindow?.scrollY || newWindow?.pageYOffset;
        let horizontalScroll = newWindow?.scrollX || newWindow?.pageXOffset;
        let height = newWindow.document.body.scrollHeight;
        if ((height - verticalScroll) < threshold ) {
          newWindow?.scrollTo(0, newWindow.document.body.scrollHeight);
        }
      }
    }, 100);

    try {
      if (typeof(tailLines) === 'number') {
        this.followLogs = '';
        this.dashboardService.viewFollowLog('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + this.podName, '/' + this.appName, '/' + tailLines).subscribe((data: any) => {
          let ws = new window.WebSocket(`${this.constantService.WS_ENDPOINT}/${data.id}`);
          ws.onopen = () => {
            console.log("Socket Connected...");
          };
          ws.onmessage = (msg: any) => {
            setTimeout(() => {
              newWindow?.document.write(`<p style="font-family: Arial, Helvetica, sans-serif">${msg.data}</p>`)
            }, 10);
            this.followLogs += msg.data;
          };
          ws.onerror = (e: any) => {
            console.error(e);
          };
  
          ws.onclose = (e: any) => {
            console.log("Socket Disconnected...");
          };

          setTimeout(() => {
            if (newWindow) {
              newWindow.onunload = () => {
                ws = new window.WebSocket(`${this.constantService.WS_ENDPOINT}/${podName}-${appName}/stop`);
                ws.onclose = (e: any) => {
                  console.log("Socket Disconnected...");
                };
                this.removeItemFromisSpinner(indexOfItem);
              }
            }
          }, 1000);
  
          this.removeItemFromisSpinner(indexOfItem);
        },
          (error) => {
            this.removeItemFromisSpinner(indexOfItem);
            console.log(error);
          });
      } else if (typeof(tailLines) === 'string') {
        this.ws = new window.WebSocket(`${this.constantService.WS_ENDPOINT}/${podName}-${appName}/stop`);
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
      }
    } catch (e) {
      this.removeItemFromisSpinner(indexOfItem);
      console.log(e);
    }
  }

  async downloadPodPreviousLogs(podName: string, appName: string) {
    let indexOfItem = this.isSpinner.push(podName + '-' + appName);
    this.podName = podName;
    this.appName = appName
    try {
      let _clusterName = this.clusterName;
      let _podName = this.podName;
      let _appName = this.appName;
      this.dashboardService.getPodsPreviousLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + this.podName, '/' + this.appName).subscribe((data: any) => {
        this.downloadData = new File([data.data], `${_clusterName}-${_podName}-${_appName}-(previous).log`, { type: 'text/plain' });
        saveAs.saveAs(this.downloadData, `${this.clusterName}-${this.podName}-${_appName}-(previous).log`)
        toastr.success(`Download Started: ${this.clusterName}-${this.podName}-${_appName}-(previous).log`);
        this.removeItemFromisSpinner(indexOfItem);
      },
      (error) => {
        this.removeItemFromisSpinner(indexOfItem);
        console.log(error);
      })
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
        let _clusterName = this.clusterName;
        let _deploymentName = this.deploymentName;
        let _clusterData = this.podsData
        let _deploymentLogs: string = '';
        let promiseArr: Promise<any>[] = [];

        for (let pod = 0; pod < _clusterData.length; pod++) {
          if (_clusterData[pod].metadata['labels'] && _clusterData[pod].metadata.labels.app === _deploymentName) {
            let podName = _clusterData[pod].metadata.name;
            for (let container = 0; container < _clusterData[pod].spec.containers.length; container++) {
              promiseArr.push(new Promise<void>(async (resolve, reject) => {
                let containerName = _clusterData[pod].spec.containers[container].name;
                this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + podName, '/' + containerName, '/' + h).subscribe((data: any) => {
                  _deploymentLogs += `<br />>>>>>>>> Log ${podName} => ${containerName} Start <<<<<<<<<br /><br />`
                  _deploymentLogs += data.data.replace(/\n\t/g, '<br />').replace(/\n/g, '<br />');
                  _deploymentLogs += `<br />>>>>>>>> Log ${podName} => ${containerName} End <<<<<<<<<br />`
                  resolve();
                },
                  (error) => {
                    this.removeItemFromisSpinner(indexOfItem);
                    console.log(error);
                  });
              }));
            }
          }
        }
        await Promise.all(promiseArr)
        let newWindow = window.open("", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
        newWindow?.document.write(`<title>${_clusterName}-${_deploymentName}-(${h}H)</title><p style="font-family: Arial, Helvetica, sans-serif">${_deploymentLogs}</p>`)
        toastr.success(`New Window Started: ${_clusterName}-${_deploymentName}-(${h}H).log`);
        this.removeItemFromisSpinner(indexOfItem);
      } else {
        let _clusterName = this.clusterName;
        let _deploymentName = this.deploymentName;
        let _clusterData = this.podsData
        let _deploymentLogs: string = '';
        let promiseArr: Promise<any>[] = [];

        for (let pod = 0; pod < _clusterData.length; pod++) {
          if (_clusterData[pod].metadata.labels.app === _deploymentName) {
            let podName = _clusterData[pod].metadata.name;
            for (let container = 0; container < _clusterData[pod].spec.containers.length; container++) {
              promiseArr.push(new Promise<void>(async (resolve, reject) => {
                let containerName = _clusterData[pod].spec.containers[container].name;
                this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + podName, '/' + containerName).subscribe((data: any) => {
                  _deploymentLogs += `<br />>>>>>>>> Log ${podName} => ${containerName} Start <<<<<<<<<br /><br />`
                  _deploymentLogs += data.data.replace(/\n\t/g, '<br />').replace(/\n/g, '<br />');
                  _deploymentLogs += `<br />>>>>>>>> Log ${podName} => ${containerName} End <<<<<<<<<br />`
                  resolve();
                },
                  (error) => {
                    this.removeItemFromisSpinner(indexOfItem);
                    console.log(error);
                  });
              }));
            }
          }
        }
        await Promise.all(promiseArr)
        let newWindow = window.open("", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
        newWindow?.document.write(`<title>${_clusterName}-${_deploymentName}-(all)</title><p style="font-family: Arial, Helvetica, sans-serif">${_deploymentLogs}</p>`)
        toastr.success(`New Window Started: ${_clusterName}-${_deploymentName}-(all).log`);
        this.removeItemFromisSpinner(indexOfItem);
      }
    } catch (e) {
      this.removeItemFromisSpinner(indexOfItem);
      console.log(e);
    }
  }
  async downloadAppLogs(_deploymentName: string, h?: any) {
    // console.log(_clusterData);
    let indexOfItem = this.isSpinner.push(_deploymentName);
    this.deploymentName = _deploymentName;
    try {
      if (h) {
        let _clusterName = this.clusterName;
        let _deploymentName = this.deploymentName;
        let _clusterData = this.podsData
        let _deploymentLogs: string = '';
        let promiseArr: Promise<any>[] = [];

        for (let pod = 0; pod < _clusterData.length; pod++) {
          if (_clusterData[pod].metadata.labels.app === _deploymentName) {
            let podName = _clusterData[pod].metadata.name;
            for (let container = 0; container < _clusterData[pod].spec.containers.length; container++) {
              promiseArr.push(new Promise<void>(async (resolve, reject) => {
                let containerName = _clusterData[pod].spec.containers[container].name;
                this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + podName, '/' + containerName, '/' + h).subscribe((data: any) => {
                  _deploymentLogs += `\n>>>>>>>> Log ${podName} => ${containerName} Start <<<<<<<<\n\n`
                  _deploymentLogs += data.data;
                  _deploymentLogs += `\n>>>>>>>> Log ${podName} => ${containerName} End <<<<<<<<\n`
                  resolve();
                },
                  (error) => {
                    this.removeItemFromisSpinner(indexOfItem);
                    console.log(error);
                  });
              }));
            }
          }
        }
        await Promise.all(promiseArr)
        let _downloadLogs = new File([_deploymentLogs], `${_clusterName}-${_deploymentName}-(${h}H).log`, { type: 'text/plain' });
        saveAs.saveAs(_downloadLogs, `${_clusterName}-${_deploymentName}-(${h}H).log`)
        toastr.success(`Download Started: ${_clusterName}-${_deploymentName}-(${h}H).log`);
        this.removeItemFromisSpinner(indexOfItem);
      } else {
        let _clusterName = this.clusterName;
        let _deploymentName = this.deploymentName;
        let _clusterData = this.podsData
        let _deploymentLogs: string = '';
        let promiseArr: Promise<any>[] = [];

        for (let pod = 0; pod < _clusterData.length; pod++) {
          if (_clusterData[pod].metadata.labels.app === _deploymentName) {
            let podName = _clusterData[pod].metadata.name;
            for (let container = 0; container < _clusterData[pod].spec.containers.length; container++) {
              promiseArr.push(new Promise<void>(async (resolve, reject) => {
                let containerName = _clusterData[pod].spec.containers[container].name;
                this.dashboardService.getPodsLogs('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + podName, '/' + containerName).subscribe((data: any) => {
                  _deploymentLogs += `\n>>>>>>>> Log ${podName} => ${containerName} Start <<<<<<<<\n\n`
                  _deploymentLogs += data.data;
                  _deploymentLogs += `\n>>>>>>>> Log ${podName} => ${containerName} End <<<<<<<<\n`
                  resolve();
                },
                  (error) => {
                    this.removeItemFromisSpinner(indexOfItem);
                    console.log(error);
                  });
              }));
            }
          }
        }
        await Promise.all(promiseArr)
        let _downloadLogs = new File([_deploymentLogs], `${_clusterName}-${_deploymentName}-(all).log`, { type: 'text/plain' });
        saveAs.saveAs(_downloadLogs, `${_clusterName}-${_deploymentName}-(all).log`)
        toastr.success(`Download Started: ${_clusterName}-${_deploymentName}-(all).log`);
        this.removeItemFromisSpinner(indexOfItem);
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
      // console.log(JSON.parse(JSON.stringify(resp)).metadata.name);
      toastr.success(`Pod is Deleted: ${JSON.parse(JSON.stringify(resp)).metadata.name}`) && await this.latestPull();
    }
  }

  async deleteEvictedPod(pods: any) {
    if (
      window.confirm(
        `Do you want to delete "Evicted Pods"?`
      )
    ) {
      this.loading = true;
      let podCount = 0;
      pods.forEach( async (pod: any) => {
        if (pod.status.reason) {
          let resp = await this.dashboardService.deletePod('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + pod.metadata.name).toPromise();
            // console.log(JSON.parse(JSON.stringify(resp)).metadata.name);
            toastr.success(`Pod is Deleted: ${JSON.parse(JSON.stringify(resp)).metadata.name}`);
        }
        else {
          podCount = podCount + 1;
        }
      });
      if (podCount === pods.length) {
        toastr.success(`No Evicted Pods Found!`);
      }
      this.loading = false;
      this.latestPull();
    }
  }

  async rolloutRestart(deploymentName: string) {
    if (
      window.confirm(
        `Do you want to rollout restart "Deployment" : ${deploymentName} ?`
      )
    ) {
      let resp = await this.dashboardService.rolloutRestart('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + deploymentName).toPromise();
      toastr.success(`Rollout Restarting: ${deploymentName}`) && await this.latestPull();
    }
  }
  async deleteDeployment(deploymentName: string) {
    if (
      window.confirm(
        `Do you want to delete "Deployment" : ${deploymentName} ?`
      )
    ) {
      if (
        window.confirm(
          `Are you sure you want to delete "Deployment" : ${deploymentName} ?`
        )
      ) {
        let resp = await this.dashboardService.deleteDeployment('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + deploymentName).toPromise();
        toastr.success(`Deployment "${deploymentName}" delete`) && await this.latestPull();
      }
    }
  }

  async showManifestDialog(deploymentName: string) {
    this.manifestDialog = true;
    this.deploymentName = deploymentName;
    setTimeout(() => {
      this.dashboardService.getDeploymentManifest('/' + this.groupId, '/' + this.clusterId, '/' + this.selectedNamespace.name, '/' + deploymentName).subscribe((data: any) => {
        this.deploymentManifest = JSON.stringify(data, undefined, 4);
        this.updatedDeploymentManifest = JSON.stringify(data, undefined, 4);
        // console.log(this.deploymentManifest);
        toastr.success(`Get Deployment Manifest: ${deploymentName}`);
      });
    }, 100);
  }

  async updateDeploymentManifest() {
    if (this.updatedDeploymentManifest && (this.updatedDeploymentManifest !== this.deploymentManifest)) {
      let data: any = {
        groupId: this.groupId,
        clusterId: this.clusterId,
        namespace: this.selectedNamespace.name,
        deploymentName: this.deploymentName,
        data: this.updatedDeploymentManifest,
      }
      // console.log(data);
      this.dashboardService.updateDeploymentManifest(data).subscribe((data: any) => {
        toastr.success(`Deployment Update: ${this.deploymentName}`);
        this.manifestDialog = false;
        this.latestPull();
      });
    }
    else {
      toastr.warning(`No Change Found: ${this.deploymentName}`);
    }
  }

  async autoReload(event?: any) {
    this.isChecked != this.isChecked
  }

  async latestPull(event?: any) {
    // this.loading = true;
    await this.getCluster(this.dashboardService.groupId, this.dashboardService.clusterId, this.dashboardService.clusterName);
    // this.loading = false;
  }
  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

}
