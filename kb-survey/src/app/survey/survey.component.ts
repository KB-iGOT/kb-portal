import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import urlConfig from '../config/url.config.json';

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
          headers: {
            Authorization:
              'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Im1vYmlsZV9kZXZpY2V2Ml9rZXkxMiJ9.eyJpc3MiOiJ1bmRlZmluZWQtZmJhZDdjOTNiYTc5ZDAyOTRhMmIwNTcyYTIzM2QzNDUzMTkyNjUxZCIsImlhdCI6MTcwNzEwNjQ2Nn0.Ps9hy_23XOvwRkYqjbqFtfQPF8FS6ZTAslOQkvrHHPYqKyCscR4hfD731Qoy992h4CDU1dVMsK1ApsXCYz1xpI-qtki6RF_jSOEvREqXgUNBXO_D8qr-RHXZiWNXuAH-x0DzzqcxYoSVGY85TCmC5fgcV5shUbaliIWnhSb7cxGBRCavi1Zfay_OhrPvJ-x-KNzW8OXUFa9QMLm-EXxmhmTBffLFtx49G-_0JJuyrRhvc43b6BJzbqeGadYLzTV5eBkR_vhvOztPGN3oUrLX2AUQ9M-gSSoduigqzzWDqEjysQn_l-m9zAN5jdjdtt-5eRo2hHWeGavFIq6BB8wJ6g',
            'Content-Type': 'application/json',
            'X-authenticated-user-token':
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImFjY2Vzc3YxX2tleTgifQ.eyJhdWQiOiJodHRwczovL3N0YWdpbmcuc3VuYmlyZGVkLm9yZy9hdXRoL3JlYWxtcy9zdW5iaXJkIiwic3ViIjoiZjo5Nzk3MzhiNy0yNTNjLTRhZGYtOTY3My1hODU3ZWViODYxMTU6NTRkYzI4MTQtZTgxNS00ZWQ5LThhNTgtNjQ2NDc4NWExZjJjIiwicm9sZXMiOlt7InJvbGUiOiJQVUJMSUMiLCJzY29wZSI6W119XSwiaXNzIjoiaHR0cHM6Ly9zdGFnaW5nLnN1bmJpcmRlZC5vcmcvYXV0aC9yZWFsbXMvc3VuYmlyZCIsInR5cCI6IkJlYXJlciIsImV4cCI6MTcwNzI4ODE4MywiaWF0IjoxNzA3MjAxNzgzfQ.y6KVwyD_qMbdZl8nohg-UtNrEchg4sMfiB5qcmnqPKZPdoInFcp553WOK3GBc9GbXOaEELO50e538a3KOIKRHD_XkqRN3jiDtpHodufDY-phqtzu2VXXAYKFG5laYPAvCtE68kJiegfNKI0eAbux9tnLQj44sKucPGEjClE8VRDEm6Aq5ZdDyt2uZ1QD9ezb_o1HVBi-yfE8Bd8zbDu9oS8FzeRdodEDcRqC5GFXnCNzvDf3FLmebnF6515R3i8NMQL8FKC09qbdf6rK4ZHIqUmnciB0xfbvfPbDLynsmRHJJHUH7t8n1sPYeJqearFPuACxwVG8MKlwMqP6d2X9jQ',
          },
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
