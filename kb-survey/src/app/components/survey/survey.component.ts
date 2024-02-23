import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiBaseService } from 'src/app/services/base-api/api-base.service';
import { InputConfig,UrlConfig } from 'src/app/interfaces/main.interface';
import urlConfig from 'src/app/config/url.config.json';

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
  constructor() { 
    this.baseApiService = inject(ApiBaseService);
    this.route = inject(ActivatedRoute);
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((queryParam:any) => {
      if(queryParam.has('bearer')){
        this.deviceType = 'mobile';
        this.authorization = queryParam['bearer'];
        this.accessToken = queryParam['user']
      }else{
        this.deviceType = 'portal';
      }
    })
    this.route.params.subscribe((param:any) => {
      this.solutionId = param['id'];
    });

    this.configuration = {
      type:'survey',
      solutionId:this.solutionId,
      fetchUrl:`${urlConfig.survey[this.deviceType].detailsURL}?solutionId=${this.solutionId}`,
      updateUrl:`${urlConfig.survey[this.deviceType].updateURL}`,
      ...this.deviceType == 'mobile' && {authorization:this.authorization,accessToken:this.accessToken}
    }
  }

}
