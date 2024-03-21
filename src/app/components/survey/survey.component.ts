import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ApiBaseService } from 'src/app/services/base-api/api-base.service';
import { InputConfig, UrlConfig } from 'src/app/interfaces/main.interface';
import urlConfig from 'src/app/config/url.config.json';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
})
export class SurveyComponent implements OnInit {
  solutionId!: string;
  configuration!: InputConfig;
  deviceType!: keyof UrlConfig;
  showSpinner: boolean = true;
  pollingInterval: any;
  bearer: string | null | undefined;
  user: string | null | undefined;
  connectSid: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((param: any) => {
      this.solutionId = param['id'];
    });

    this.checkCookies();

    this.startPollingIfNeeded();
  }

  checkCookies() {
    this.bearer = this.cookieService.get('bearer') || localStorage.getItem('bearer');
    this.user = this.cookieService.get('user') || localStorage.getItem('user');
    this.connectSid = this.cookieService.get('connect.sid');

    if (this.bearer && this.user) {
      console.log('Mobile device!!!!!!!!!!!!!');
      this.deviceType = 'mobile';
      clearInterval(this.pollingInterval); 
    } else if (this.connectSid) {
      console.log('Portal device!!!!!!!!!!!!!');
      this.deviceType = 'portal';
      clearInterval(this.pollingInterval); 
    } else {
      console.log('Cookies not set yet, continuing polling...');
    }

    this.updateConfiguration();
  }

  updateConfiguration() {
    if (this.deviceType === 'mobile' || this.deviceType === 'portal') {
      this.configuration = {
        type: 'survey',
        solutionId: this.solutionId,
        fetchUrl: `${urlConfig.survey[this.deviceType].detailsURL}?solutionId=${this.solutionId}`,
        updateUrl: `${urlConfig.survey[this.deviceType].updateURL}`,
        ...this.deviceType == 'mobile' && {authorization:`${this.bearer}`,accessToken:this.user}
      };
      this.showSpinner = false;
    } else {
      this.startPollingIfNeeded();
    }
  }

  startPollingIfNeeded() {
    if (!this.pollingInterval) {
      this.pollingInterval = setInterval(() => {
        this.checkCookies();
      }, 1000);
    }
  }
}
