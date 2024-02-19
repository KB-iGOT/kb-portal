import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from  '@angular/platform-browser/animations';
import { SurveyComponent } from './survey/survey.component';
import { ApiInterceptorService } from  './services/interceptor/api-interceptor.service';
import { ApiBaseService } from './services/base-api/api-base.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialogModule} from '@angular/material/dialog';
import { DialogComponent } from './shared/components/dialog/dialog.component';
import {MatCardModule} from '@angular/material/card';
@NgModule({
  declarations: [
    AppComponent,
    SurveyComponent,
    SpinnerComponent,
    DialogComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    AppRoutingModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatCardModule
  ],
  providers: [ 
    {
    provide: HTTP_INTERCEPTORS,
    useClass: ApiInterceptorService,
    multi: true
  }, ApiBaseService],
  bootstrap: [AppComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
