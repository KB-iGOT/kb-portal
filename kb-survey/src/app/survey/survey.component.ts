import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import urlConfig from '../config/url.config.json';
import { ApiBaseService } from '../services/base-api/api-base.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
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
  profileDetails:
    | { district: any; state: any; block: any; school: any; role: any }
    | undefined;

  constructor(private toastService: ToastrService, private _snackBar: MatSnackBar,
    public dialog: MatDialog,) {
    this.baseApiService = inject(ApiBaseService);
    this.route = inject(ActivatedRoute);
  }


  ngOnInit(): void {
    // this.openConfirmationDialog();

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

  animal: string = "qwe";
  name: string = "ds";



  openConfirmationDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data: {
        title: 'Confirmation',
        message: 'Are you sure you want to save survey?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('User confirmed');
        return true

      } else {
        console.log('User canceled');
        return false
      }
    });
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

    console.log("event", event?.detail?.status)
    const evidenceData = { ...event.detail.data, status: event.detail.status };


 

    if(event?.detail?.status == "submit"){
      const dialogRef = this.dialog.open(DialogComponent, {
        width: '250px',
        data: {
          title: 'Confirmation',
          message: 'Are you sure you want to save survey?'
        }
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          console.log('User confirmed');
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
            this._snackBar.open("Successfully your survey has been saved", 'Success', {
              horizontalPosition: 'center',
              verticalPosition: 'top',
              duration: 3000,
              panelClass: ['red-snackbar', 'login-snackbar'],
            });
    
            this.showSpinner = false;
    
          },
          (err:any) => {
            this.toastService.error(err?.error?.message);
          }
          );
  
        } else {
          console.log('User canceled');
        }
      });
    }else{
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
        this._snackBar.open("Successfully your survey has been saved", 'Success', {
          horizontalPosition: 'center',
          verticalPosition: 'top',
          duration: 3000,
          panelClass: ['red-snackbar', 'login-snackbar'],
        });

        this.showSpinner = false;

      },
      (err:any) => {
        this.toastService.error(err?.error?.message);
      }
      );
    }

  }

  showMessage() {
    this.toastService.success('This is a test message');
  }





}
