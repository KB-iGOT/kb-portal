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
  profileDetails:
    | { district: any; state: any; block: any; school: any; role: any }
    | undefined;
  constructor() {
    this.baseApiService = inject(ApiBaseService);
    this.route = inject(ActivatedRoute);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParam) => {
      this.solutionId = queryParam['solutionId'];
      this.profileDetails = {
        district: queryParam['district'],
        state: queryParam['state'],
        block: queryParam['block'],
        school: queryParam['school'],
        role: queryParam['role'],
      };
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
