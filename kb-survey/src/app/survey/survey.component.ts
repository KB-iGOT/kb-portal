import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import urlConfig from '../config/url.config.json';
import { ApiBaseService } from '../services/base-api/api-base.service';
import {
  MatDialog
} from '@angular/material/dialog';
import { DialogComponent } from '../shared/components/dialog/dialog.component';
import { ResponseService } from '../services/observable/response.service';
@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
})
export class SurveyComponent implements OnInit {
  showSpinner: boolean = false;
  assessmentResult: any;
  baseApiService;
  route;
  solutionId!: string | null;
  district: any;
  state: any;
  block: any;
  school: any;
  role: any;
  profileDetails: any;

  constructor(private responseService: ResponseService,
    public dialog: MatDialog, private router: Router) {
    this.baseApiService = inject(ApiBaseService);
    this.route = inject(ActivatedRoute);
  }


  ngOnInit(): void {
    this.route.params.subscribe(param => {
      this.solutionId = param['id']
    })

    this.route.queryParams.subscribe((queryParam) => {
      this.profileDetails = queryParam;
    });
    this.fetchSurveyDetails();
  }




  openConfirmationDialog(title: any, message: any, timer: any, actionBtns: boolean,
    btnLeftLabel: any, btnRightLabel: any): Promise<boolean> {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: title,
        message: message,
        actionBtns: actionBtns,
        btnLeftLabel: btnLeftLabel,
        btnRightLabel: btnRightLabel,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        return true

      } else {
        return false
      }
    });

    if (timer == 3000) {
      setTimeout(() => {
        dialogRef.close();
      }, 3000);
    }
    return dialogRef.afterClosed().toPromise();

  }


  fetchSurveyDetails() {
    this.showSpinner = true;
    this.baseApiService
      .post(
        urlConfig.surveyDetailsURL +
        `?solutionId=${this.solutionId}`,
        this.profileDetails
      )
      .subscribe((res: any) => {
        if (res?.message == "Survey details fetched successfully") {
          this.assessmentResult = res.result;
        }
        else if (res?.message == "Could not found solution details") {
         this.responseService.setResponse("Could not found solution details.");
          this.router.navigateByUrl('/response');
        } else {
          this.openConfirmationDialog('Error', 'Something went wrong, try again', 3000, false, '', '')
        }
        this.showSpinner = false;
        console.log(this.assessmentResult);
      });
  }

  async submitOrSaveEvent(event: any) {
const evidenceData = { ...event.detail.data, status: event.detail.status };
    if (event?.detail?.status == "submit") {
      const response = await this.openConfirmationDialog('Confirmation', 'Are you sure you want to submit survey?', 'fasle', true, 'Cancel', 'Confirm')
      if (response) {
        this.showSpinner = true;
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
            this.responseService.setResponse("Thank you, your survey has been Submited.");
            this.showSpinner = false;
            this.router.navigateByUrl('/response');
          },
            (err: any) => {
              this.openConfirmationDialog('Error', 'Something went wrong, try again', 3000, false, '', '')
            }
          );
      }
    } else {
      this.showSpinner = true;

      this.baseApiService
        .post(
          urlConfig.surveySubmissionURL +
          this.assessmentResult.assessment.submissionId,
          {
            ...this.profileDetails,
            evidence: evidenceData,
          }
        )
        .subscribe(async (res: any) => {
          this.showSpinner = false;
          const responses = await this.openConfirmationDialog('Success', `Successfully your survey has been saved. Do you want to continue?`, "false", true, 'Later', 'Continue');
          if (responses) {

          } else {
            this.responseService.setResponse("Thank you, your survey has been Saved.");
            this.router.navigateByUrl('/response');
          }
        },
          (err: any) => {
            this.openConfirmationDialog('Error', 'Something went wrong, try again', 3000, false, '', '')

          }
        );
    }

  }
}
