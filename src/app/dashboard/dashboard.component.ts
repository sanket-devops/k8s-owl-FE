import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../service/dashboard.service';
import { Router } from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Idashboard, ICluster } from '../interface/Idashboard';
import { ConstantService } from '../service/constant.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  responseData: any = undefined;
  clusterData: any = undefined;

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
      res = <any>this.dashboardService.getClusters().subscribe((data: any)=> {
        this.responseData = data.data;
        console.log(this.responseData);
    });
    } catch (e) {
      console.log(e);
    }
  }
  async getCluster(groupId: string, clusterId: string) {
    this.clusterData = undefined;
    let res = [];
    try {
      res = <any>this.dashboardService.getPods( '/' + groupId, '/' + clusterId).subscribe((data: any)=> {
        console.log(data);
        this.clusterData = data;
    });
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

