import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from  '@angular/platform-browser/animations';
import { ApiInterceptorService } from  './services/interceptor/api-interceptor.service';
import { ApiBaseService } from './services/base-api/api-base.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import {MatDialogModule} from '@angular/material/dialog';
import { DialogComponent } from './shared/components/dialog/dialog.component';
import {MatCardModule} from '@angular/material/card';
import { ResponseComponent } from './shared/components/response/response.component';
import { QuestionnaireComponent } from './shared/components/questionnaire/questionnaire.component';
import { ObservationComponent } from './components/observation/observation.component';
import { SurveyComponent } from './components/survey/survey.component';
@NgModule({
  declarations: [
    AppComponent,
    SurveyComponent,
    ObservationComponent,
    SpinnerComponent,
    DialogComponent,
    ResponseComponent,
    QuestionnaireComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
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
