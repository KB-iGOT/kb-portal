import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import urlConfig from '../config/url.config.json';
import secret from '../../../secret.json';
@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
})
export class SurveyComponent implements OnInit {
  assessment: any;
  http;
  route;
  id!: string | null;
  solutionId!: string | null;
  district: any;
  state: any;
  block: any;
  school: any;
  role: any;

  constructor() {
    this.http = inject(HttpClient);
    this.route = inject(ActivatedRoute);
  }

  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      this.id = param['id'];
    });

    this.route.queryParams.subscribe((queryParam) => {
      this.solutionId = queryParam['solutionId'];
      this.district = queryParam['district'];
      this.state = queryParam['state'];
      this.block = queryParam['block'];
      this.school = queryParam['school'];
      this.role = queryParam['role'];
    });

    this.fetchSurveyDetails();
  }

  fetchSurveyDetails() {
    this.http
      .post(
        urlConfig.baseURL +
          urlConfig.surveyURL +
          this.id +
          `?solutionId=${this.solutionId}`,
        {
          district: this.district,
          state: this.state,
          block: this.block,
          school: this.school,
          role: this.role,
        },
        {
          headers: secret
        }
      )
      .pipe(
        catchError((error: any) => {
          if (error.status === 0) {
            console.error('Network error:', error.message);
          } else if (error.status >= 400 && error.status < 500) {
            console.error('Client-side error:', error.message);
          } else if (error.status >= 500) {
            console.error('Server error:', error.message);
          }
          throw new Error('Unable to fetch the survey. Please try again');
        })
      )
      .subscribe((res: any) => {
        this.assessment = res.result;
        console.log(this.assessment);
      });
  }

  submitOrSaveEvent(event: any): void {
    console.log(event, 'event from the webcomponent');
  }
}
