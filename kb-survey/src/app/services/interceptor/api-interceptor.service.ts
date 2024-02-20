import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import secret from '../../../../secret.json';
import { ResponseService } from '../observable/response.service';
import { Router } from '@angular/router';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class ApiInterceptorService implements HttpInterceptor {
  constructor(private responseService: ResponseService, private router:Router,
    public dialog: MatDialog){

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

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const modifiedRequest = request.clone({
      setHeaders: {
        'Authorization': secret.Authorization,
        'X-authenticated-user-token':secret['X-authenticated-user-token']
      }
    });

    return next.handle(modifiedRequest).pipe(
      tap(event => {
        // if (event instanceof HttpResponse) {
        //   console.log('Received HTTP response:', event);
        //   console.log('Result:', event?.body?.result);
        //   if(event?.body?.result){

        //   }
        //   else if(event?.body?.message == "Could not found solution details"){
        //     this.responseService.setProduct("Could not found solution details.");
        //     this.router.navigateByUrl('/response');
        //   }
          
        //   else{
        // this.openConfirmationDialog('Error', 'Survey could not be found, Try again after some time', 3000, false, '', '');
            
        //   }
        // }
      }),

      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          console.error('Network error:', error.message);
        } else if (error.status >= 400 && error.status < 500) {
          console.error('Client-side error:', error.message);
        } else if (error.status >= 500) {
          console.error('Server error:', error.message);
        }
        return throwError('Unable to fetch the survey. Please try again');
      })
    );
  }
}
