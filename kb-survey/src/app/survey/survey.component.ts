import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import urlConfig from '../config/url.config.json';
import { ApiBaseService } from '../services/base-api/api-base.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatDialog
} from '@angular/material/dialog';
import { DialogComponent } from '../shared/components/dialog/dialog.component';
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
  saveAndSubmitStatus: string = 'noAction'

  constructor(private _snackBar: MatSnackBar,
    public dialog: MatDialog,) {
    this.baseApiService = inject(ApiBaseService);
    this.route = inject(ActivatedRoute);
  }


  ngOnInit(): void {
    // this.openConfirmationDialog();
    this.route.params.subscribe(param => {
      this.solutionId = param['id']
    })

    this.route.queryParams.subscribe((queryParam) => {
      console.log(queryParam);

      this.profileDetails = queryParam;
    });

    this.fetchSurveyDetails();
  }




  openConfirmationDialog(title: any, message: any, timer: any, actionBtns: boolean,
    btnLeftLabel: any, btnRightLabel: any): Promise<boolean> {
    const dialogRef = this.dialog.open(DialogComponent, {
      // width: '250px',
      // minWidth: 'max-content',
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
     
        
        if(res?.message == "Survey details fetched successfully"){
          this.assessmentResult = res.result;
        }
       else if(res?.message == "Could not found solution details"){
        this.openConfirmationDialog('Error', 'Survey could not be found, Try again after some time', 3000, false, '', '')

        }else{
          this.openConfirmationDialog('Error', 'Something went wrong, try again', 3000, false, '', '')

        }
      
        this.showSpinner = false;
        console.log(this.assessmentResult);
      });
  }

  async submitOrSaveEvent(event: any) {

    console.log("event", event?.detail?.status)
    const evidenceData = { ...event.detail.data, status: event.detail.status };

    if (event?.detail?.status == "submit") {
      const response = await this.openConfirmationDialog('Confirmation', 'Are you sure you want to save survey?', 'fasle', true, 'Cancel', 'Confirm')
      console.log(response)
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


            this.openConfirmationDialog('Success', `Successfully your survey has been submited`, 'fasle', false, '', '')
            this.saveAndSubmitStatus = "Submited"
            this.showSpinner = false;

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
             
            } else{
              this.saveAndSubmitStatus = "Saved"
            }
         

       

        },
          (err: any) => {
            this.openConfirmationDialog('Error', 'Something went wrong, try again', 3000, false, '', '')

          }
        );
    }

  }



  // async showDialog() {


  //   try {
  //     let mes: any = await this.openConfirmationDialog('Confirmation', 'Are you sure you want to save survey?', 'fasle')
  //     console.log(mes)
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }


}
