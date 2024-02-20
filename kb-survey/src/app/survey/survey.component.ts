import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import urlConfig from '../config/url.config.json';
import { ApiBaseService } from '../services/base-api/api-base.service';
import { catchError } from 'rxjs';
@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
})
export class SurveyComponent implements OnInit {
  assessmentResult: any;
  fileUploadResponse: any = null;
  baseApiService;
  route;
  solutionId!: string | null;
  district: any;
  state: any;
  block: any;
  school: any;
  role: any;
  profileDetails: any;

  constructor() {
    this.baseApiService = inject(ApiBaseService);
    this.route = inject(ActivatedRoute);
  }

  ngOnInit(): void {
    window.addEventListener(
      'message',
      this.receiveFileUploadMessage.bind(this),
      false
    );
    this.route.params.subscribe((param) => {
      this.solutionId = param['id'];
    });

    this.route.queryParams.subscribe((queryParam) => {
      const { solutionId, ...detailsOfProfile } = queryParam;
      this.profileDetails = detailsOfProfile;
    });

    this.fetchSurveyDetails();
  }

  receiveFileUploadMessage(event: any) {
    if (event.data.question_id) {
      const formData = new FormData();
      formData.append('file', event.data.file);
      let payload: any = {};
      payload['ref'] = 'survey';
      payload['request'] = {};
      const submissionId = event.data.submissionId;
      payload['request'][submissionId] = {
        files: [event.data.name],
      };
      this.baseApiService
        .post(urlConfig.presignedURL, payload)
        .pipe(
          catchError((err) => {
            this.fileUploadResponse = {
              status: 400,
              data: null,
              question_id: event.data.question_id,
            };
            throw new Error('Unable to upload the file. Please try again');
          })
        )
        .subscribe((response: any) => {
          const presignedUrlData = response['result'][submissionId].files[0];
          this.baseApiService
            .put(presignedUrlData.url, formData)
            .pipe(
              catchError((err) => {
                this.fileUploadResponse = {
                  status: 400,
                  data: null,
                  question_id: event.data.question_id,
                };
                throw new Error('Unable to upload the file. Please try again');
              })
            )
            .subscribe((cloudResponse: any) => {
              const obj: any = {
                name: event.data.name,
                url: presignedUrlData.url.split('?')[0],
                previewUrl: presignedUrlData.downloadableUrl.split('?')[0],
              };
              for (const key of Object.keys(presignedUrlData.payload)) {
                obj[key] = presignedUrlData['payload'][key];
              }
              this.fileUploadResponse = {
                status: 200,
                data: obj,
                question_id: event.data.question_id,
              };
            });
        });
    }
  }

  fetchSurveyDetails() {
    this.baseApiService
      .post(
        urlConfig.surveyDetailsURL + `?solutionId=${this.solutionId}`,
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
        window.postMessage(res, '*');
      });
  }
}
