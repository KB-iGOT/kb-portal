import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiBaseService } from 'src/app/services/base-api/api-base.service';
import { InputConfig,UrlConfig } from 'src/app/interfaces/main.interface';
import urlConfig from 'src/app/config/url.config.json';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent implements OnInit {
  baseApiService: any;
  route: ActivatedRoute;
  solutionId!: string;
  configuration!:InputConfig;
  deviceType!:keyof UrlConfig;
  authorization: any;
  accessToken: any;
  cookieService: CookieService;
  constructor() { 
    this.baseApiService = inject(ApiBaseService);
    this.route = inject(ActivatedRoute);
    this.cookieService = inject(CookieService);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.checkCookies();
    },500)
  }

  checkCookies(){
    if(this.cookieService.check('bearer') && this.cookieService.check('user')){
      this.authorization = this.cookieService.get('bearer');
      this.accessToken = this.cookieService.get('user');
      this.deviceType = 'mobile';
    }else{
      this.deviceType = 'portal';
    }
    this.route.params.subscribe((param:any) => {
      this.solutionId = param['id'];
    });
    this.configuration = {
      type:'survey',
      solutionId:this.solutionId,
      fetchUrl:`${urlConfig.survey[this.deviceType].detailsURL}?solutionId=${this.solutionId}`,
      updateUrl:`${urlConfig.survey[this.deviceType].updateURL}`,
      ...this.deviceType == 'mobile' && {authorization:`${this.authorization}`,accessToken:this.accessToken}
    }
  }

}
