import { Component, Input, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InputConfig, UrlConfig } from 'src/app/interfaces/main.interface';
import { ApiBaseService } from 'src/app/services/base-api/api-base.service';
import urlConfig from 'src/app/config/url.config.json';
import { HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';

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
  showSpinner: boolean = false;
  headers!: HttpHeaders;
  observationId:any;
  cookieService:CookieService;

  constructor(public dialog: MatDialog) { 
    this.baseApiService = inject(ApiBaseService);
    this.route = inject(ActivatedRoute);
    this.cookieService = inject(CookieService);
  }

  ngOnInit(): void {
    if(this.cookieService.check('bearer') && this.cookieService.check('user')){
      this.authorization = this.cookieService.get('bearer');
      this.accessToken = this.cookieService.get('user');
      this.deviceType = 'mobile';

      this.headers = new HttpHeaders({
        Authorization: `Bearer ${this.authorization}` as string,
        'X-authenticated-user-token': this.accessToken,
      });
    }else{
      this.deviceType = 'portal';
    }
    this.route.params.subscribe((param:any) => {
      console.log(param)
      this.solutionId = param['id'];
      this.entityId = param['entity']
    });
    this.addEntity();
  }


  addEntity() {
    this.showSpinner = true;
    let payload: any = {
      course: this.entityId,
    };
    this.baseApiService
      .post(
        urlConfig['observation'][this.deviceType].addEntityURL + `?solutionId=${this.solutionId}`,
          payload, this.headers)
      .pipe(
        catchError((err) => {
          this.errorDialog();
          throw new Error('Could not fetch the details');
        })
      )
      .subscribe((res: any) => {
        if (res?.result) {
          this.observationId = res?.result?._id;
          this.configuration = {
            type:'observation',
            solutionId:this.solutionId,
            entityId:this.entityId,
            fetchUrl:`${urlConfig.observation[this.deviceType].detailsURL}/${this.observationId}?entityId=${this.entityId}&submissionNumber=1`,
            updateUrl:`${urlConfig.observation[this.deviceType].updateURL}`,
            ...this.deviceType == 'mobile' && {authorization:this.authorization,accessToken:this.accessToken}
          }
        } else {
          this.errorDialog();
        }
        this.showSpinner = false;
      });
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
}

