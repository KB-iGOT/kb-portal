import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { SurveyComponent } from './survey/survey.component';

const routes: Routes = [
  { path: 'survey', 
    component:SurveyComponent,
  },
  {
    path: '',
    component: AppComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
