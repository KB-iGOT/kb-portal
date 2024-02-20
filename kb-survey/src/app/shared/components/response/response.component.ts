import { Component, OnInit } from '@angular/core';
import { ResponseService } from 'src/app/services/observable/response.service';

@Component({
  selector: 'app-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.scss']
})
export class ResponseComponent implements OnInit {
  response:any = "Page Not Found"
  constructor(private responseService:ResponseService) { 
    this.responseService.sendResponse.subscribe((value) => {
      this.response = value;
    });
  }

  ngOnInit(): void {
  }

}
