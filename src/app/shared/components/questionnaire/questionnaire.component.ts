import { Component, Input, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import urlConfig from '../../../config/url.config.json';
import { ApiBaseService } from '../../../services/base-api/api-base.service';
import { catchError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { ResponseService } from '../../../services/observable/response.service';
import { UrlConfig, InputConfig } from '../../../interfaces/main.interface';
import { HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss'],
})
export class QuestionnaireComponent implements OnInit {
  @Input('config') config!: InputConfig;
  showSpinner: boolean = false;
  assessmentResult: any;
  fileUploadResponse: any = null;
  baseApiService;
  route;
  profileDetails: any;
  deviceType!: keyof UrlConfig;
  headers!: HttpHeaders;

  constructor(
    private responseService: ResponseService,
    public dialog: MatDialog,
    private router: Router
  ) {
    this.baseApiService = inject(ApiBaseService);
    this.route = inject(ActivatedRoute);
  }

  ngOnInit(): void {
    window.addEventListener(
      'message',
      this.receiveFileUploadMessage.bind(this),
      false
    );
    this.deviceType = this.config.accessToken ? 'mobile' : 'portal';
    if (this.config.accessToken) {
      this.headers = new HttpHeaders({
        Authorization: `Bearer ${this.config.authorization}` as string,
        'X-authenticated-user-token': this.config.accessToken,
      });
    }
    this.fetchDetails();
  }

  receiveFileUploadMessage(event: any) {
    if (event.data.question_id) {
      let payload: any = {};
      payload['ref'] = 'survey';
      payload['request'] = {};
      const submissionId = event.data.submissionId;
      payload['request'][submissionId] = {
        files: [event.data.name],
      };
      this.baseApiService
        .post(
          urlConfig[this.config.type][this.deviceType].presignedURL,
          payload,
          this.headers
        )
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
          const headers = new HttpHeaders({
            'Content-Type': 'multipart/form-data'
          });
          this.baseApiService
            .putWithFullURL(`${presignedUrlData.url}`, event.data.file, headers)
            .pipe(
              catchError((err) => {
                this.fileUploadResponse = {
                  status: 400,
                  data: null,
                  question_id: event.data.question_id,
                };
                throw new Error('Unable to upload the file. Please try again 111');
              })
            )
            .subscribe((cloudResponse: any) => {
              const obj: any = {
                name: event.data.name,
                url: `${presignedUrlData.url}`.split('?')[0],
                previewUrl:presignedUrlData.getDownloadableUrl[0]
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

  fetchDetails() {
    this.showSpinner = true;
    let payload: any = {
      course: this.config.entityId,
    };
    this.baseApiService
      .post(this.config.fetchUrl, payload, this.headers)
      .pipe(
        catchError((err) => {
          this.errorDialog();
          throw new Error('Could not fetch the details');
        })
      )
      .subscribe((res: any) => {
        if (res?.result) {
          this.assessmentResult = res.result;
        } else if (!res.result) {
          this.redirectionFun(res.message);
        } else {
          this.errorDialog();
        }
        this.showSpinner = false;
      });
  }

  async submitOrSaveEvent(event: any) {
    const evidenceData = { ...event.detail.data, status: event.detail.status };
    if (event?.detail?.status == 'submit') {
      const confirmationParams = {
        title: 'Confirmation',
        message: `Are you sure you want to submit ${this.config.type}? <br> ${this.config.type} can be submitted only once and becomes uneditable after submission.`,
        timer: 'fasle',
        actionBtns: true,
        btnLeftLabel: 'Cancel',
        btnRightLabel: 'Confirm',
      };
      const response = await this.openConfirmationDialog(confirmationParams);
      if (!response) {
        return;
      }
    }
    this.showSpinner = true;
    this.baseApiService
      .post(
        this.config.updateUrl + this.assessmentResult.assessment.submissionId,
        {
          evidence: evidenceData,
        },
        this.headers
      )
      .pipe(
        catchError((err) => {
          this.errorDialog();
          if (this.deviceType == 'mobile') {
            window.parent.postMessage(
              JSON.stringify({
                status: 400,
                message: `Error while submission`,
              })
            );
          }
          throw new Error(`Update api has failed`);
        })
      )
      .subscribe(async (res: any) => {
        this.showSpinner = false;
        let responses = false;
        if (event?.detail?.status == 'draft') {
          const confirmationParams = {
            title: 'Success',
            message: `Successfully your ${this.config.type} has been saved. Do you want to continue?`,
            timer: false,
            actionBtns: true,
            btnLeftLabel: 'Later',
            btnRightLabel: 'Continue',
          };
          responses = await this.openConfirmationDialog(confirmationParams);
        }
        let msgRes = event?.detail?.status == 'draft' ? 'saved, please complete the survey as soon as possible' : 'submitted';

        if (!responses) {
            window.parent.postMessage(
              JSON.stringify({
                status: 200,
                message: `${this.config.type} has been submitted successfully`,
              })
            );

            this.redirectionFun(
              `Thank you, your ${this.config.type} has been ${msgRes}.`
            );
          }
          
      });
  }

  redirectionFun(msg: string) {
    this.responseService.setResponse(msg);
    this.router.navigateByUrl('/response');
  }

  openConfirmationDialog(confirmationParams: any): Promise<boolean> {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: confirmationParams,
    });

    dialogRef.afterClosed().subscribe((result) => {
      return result;
    });

    if (confirmationParams?.timer == 3000) {
      setTimeout(() => {
        dialogRef.close();
      }, 3000);
    }
    return dialogRef.afterClosed().toPromise();
  }

  errorDialog() {
    const confirmationParams = {
      title: 'Error',
      message: 'Something went wrong, try again',
      timer: 3000,
      actionBtns: false,
      btnLeftLabel: '',
      btnRightLabel: '',
    };
    this.openConfirmationDialog(confirmationParams);
  }
}
