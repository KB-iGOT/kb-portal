import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import urlConfig from '../config/url.config.json';
import { ApiBaseService } from '../services/base-api/api-base.service';
import { catchError } from 'rxjs';
import {
  MatDialog
} from '@angular/material/dialog';
import { DialogComponent } from '../shared/components/dialog/dialog.component';
import { ResponseService } from '../services/observable/response.service';

interface UrlConfig {
  portal: {
      surveyDetailsURL: string;
      surveySubmissionURL: string;
      presignedURL: string;
  };
  mobile: {
      surveyDetailsURL: string;
      surveySubmissionURL: string;
      presignedURL: string;
  };
}
@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
})
export class SurveyComponent implements OnInit {
  showSpinner: boolean = false;
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
  deviceType!:keyof UrlConfig;

  constructor(private responseService: ResponseService,
    public dialog: MatDialog, private router: Router) {
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
      const { device, ...detailsOfProfile } = queryParam;
      this.profileDetails = detailsOfProfile;
      this.deviceType = device;
    });
    this.fetchSurveyDetails();
  }

  openConfirmationDialog(confirmationParams: any): Promise<boolean> {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: confirmationParams
    });

    dialogRef.afterClosed().subscribe(result => {
      return result
    });

    if (confirmationParams?.timer == 3000) {
      setTimeout(() => {
        dialogRef.close();
      }, 3000);
    }
    return dialogRef.afterClosed().toPromise();

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
        .post(urlConfig[this.deviceType].presignedURL, payload)
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
    this.showSpinner = true;
    this.baseApiService
      .post(
        urlConfig[this.deviceType].surveyDetailsURL + `?solutionId=${this.solutionId}`,
        this.profileDetails
      )
      .subscribe((res: any) => {
        if (res?.message == "Survey details fetched successfully") {
          this.assessmentResult = res.result;
        }
        else if (res?.message == "Could not found solution details") {
          this.redirectionFun("Could not found solution details.");
        } else {
          this.errorDialog();
        }
        this.showSpinner = false;
      },
      (err:any) => {
        this.errorDialog();
      }
      );
  }

  async submitOrSaveEvent(event: any) {
    console.log(event?.detail?.status)
    const evidenceData = { ...event.detail.data, status: event.detail.status };
    if (event?.detail?.status == "submit") {
      const confirmationParams = {
        title: "Confirmation",
        message: "Are you sure you want to submit survey?",
        timer: 'fasle',
        actionBtns: true,
        btnLeftLabel: "Cancel",
        btnRightLabel: "Confirm"
      };
      const response = await this.openConfirmationDialog(confirmationParams);
      if (!response) {
        return;
      }
    }
    this.showSpinner = true;
    this.baseApiService
      .post(
        urlConfig[this.deviceType].surveySubmissionURL +
        this.assessmentResult.assessment.submissionId,
        {
          ...this.profileDetails,
          evidence: evidenceData,
        }
      )
      .subscribe(async (res: any) => {
        this.showSpinner = false;
        window.postMessage(res, '*');
        let responses = false;
        if (event?.detail?.status == "draft") {
          const confirmationParams = {
            title: "Success",
            message: "Successfully your survey has been saved. Do you want to continue?",
            timer: false,
            actionBtns: true,
            btnLeftLabel: "Later",
            btnRightLabel: "Continue"
          };
          responses = await this.openConfirmationDialog(confirmationParams);
        }
        if (!responses) {
          let msgRes = event?.detail?.status == "draft" ? "Saved" : "Submited"
          this.redirectionFun(`Thank you, your survey has been ${msgRes}`);
        }
      },
        (err: any) => {
          this.errorDialog();
        }
      );
  }

  redirectionFun(msg: string) {
    this.responseService.setResponse(msg);
    this.router.navigateByUrl('/response');
  }

  errorDialog() {
    const confirmationParams = {
      title: "Error",
      message: "Something went wrong, try again",
      timer: 3000,
      actionBtns: false,
      btnLeftLabel: "",
      btnRightLabel: ""
    };
    this.openConfirmationDialog(confirmationParams)
  }
}
