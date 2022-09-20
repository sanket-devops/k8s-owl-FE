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

  constructor(
    public constantService: ConstantService,
    public dashboardService: DashboardService,
    public router: Router,
    private http: HttpClient
    ) { }
  async ngOnInit() {

  }
  async getLogs() {
    let res = [];
    try {
      res = <any>this.dashboardService.get('/6328b87f377f479c93b59ae5').subscribe((data: any)=> {
        console.log(data);
        this.responseData = data;
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

