import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import urlConfig from '../config/url.config.json';
import { ApiBaseService } from '../services/base-api/api-base.service';
@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
})
export class SurveyComponent implements OnInit {
  assessmentResult: any;
  baseApiService;
  route;
  solutionId!: string | null;
  district: any;
  state: any;
  block: any;
  school: any;
  role: any;
  profileDetails:any;
  constructor() {
    this.baseApiService = inject(ApiBaseService);
    this.route = inject(ActivatedRoute);
  }

  ngOnInit(): void {
    this.route.params.subscribe(param => {
      this.solutionId = param['id']
    })
    
    this.route.queryParams.subscribe((queryParam) => {
      const {solutionId, ...detailsOfProfile } = queryParam
      this.profileDetails = detailsOfProfile
    });

    this.fetchSurveyDetails();
  }

  fetchSurveyDetails() {
    this.baseApiService
      .post(
          urlConfig.surveyDetailsURL +
          `?solutionId=${this.solutionId}`,
        this.profileDetails
      )
      .subscribe((res: any) => {
        this.assessmentResult = res.result;
        console.log(this.assessmentResult);
      });
  }

  submitOrSaveEvent(event: any): void {
    const evidenceData = { ...event.detail.data, status: event.detail.status };
    this.baseApiService
      .post(
          urlConfig.surveySubmissionURL +
          this.assessmentResult.assessment.submissionId,
        {
          ...this.profileDetails,
          evidence: evidenceData,
        }
      )
      .subscribe((res: any) => {
        console.log(res);
      });
  }
}
