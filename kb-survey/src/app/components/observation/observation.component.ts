import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InputConfig, UrlConfig } from 'src/app/interfaces/main.interface';
import { ApiBaseService } from 'src/app/services/base-api/api-base.service';
import urlConfig from 'src/app/config/url.config.json';
@Component({
  selector: 'app-observation',
  templateUrl: './observation.component.html',
  styleUrls: ['./observation.component.scss']
})
export class ObservationComponent implements OnInit {
  baseApiService: any;
  route: ActivatedRoute;
  solutionId!: string;
  configuration!:InputConfig;
  deviceType!:keyof UrlConfig;
  authorization: any;
  accessToken: any;
  entityId: any;
  constructor() { 
    this.baseApiService = inject(ApiBaseService);
    this.route = inject(ActivatedRoute);
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((queryParam:any) => {
      if(queryParam.has('bearer')){
        this.deviceType = 'mobile';
        this.authorization = queryParam.get('bearer');
        this.accessToken = queryParam.get('user');
      }else{
        this.deviceType = 'portal';
      }
    })
    this.route.params.subscribe((param:any) => {
      this.solutionId = param['id'];
      this.entityId = param['entity']
    });

    this.configuration = {
      type:'observation',
      solutionId:this.solutionId,
      fetchUrl:`${urlConfig.observation[this.deviceType].detailsURL}/${this.solutionId}?entityId=${this.entityId}`,
      updateUrl:`${urlConfig.observation[this.deviceType].updateURL}`,
      ...this.deviceType == 'mobile' && {authorization:this.authorization,accessToken:this.accessToken}
    }
  }

}

