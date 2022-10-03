import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ConstantService} from '../service/constant.service';

declare let toastr: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  data = {
    u: '',
    p: '',
  };
  m = '\x49\x6E\x76\x61\x6C\x69\x64\x20\x66\x6F\x72\x6D\x61\x74\x20\x6F\x66\x20\x6C\x6F\x67\x69\x6E\x2E';

  constructor(
    private router: Router,
    private constantService: ConstantService,
  ) {
  }

  ngOnInit(): void {
  }

  login() {
    let found = false;
    for (let item of this.constantService.vu) {
      if (item.u === this.data.u && item.p === this.data.p) {
        localStorage.setItem('token', this.constantService.getEncryptedData(item));
        found = true;
        this.router.navigate(['dashboard']);
      }
    }
    if (!found) toastr.error(this.m);
  }

}
