import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'kb-survey';
  
  ngOnInit(){
    const buildNumber = (<HTMLInputElement>document.getElementById('buildNumber'));
    const version = require('package.json').version;
    buildNumber.value = version
  }
}
