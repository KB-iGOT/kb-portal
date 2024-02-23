import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { SurveyComponent } from './survey/survey.component';
import { ResponseComponent } from './shared/components/response/response.component';

const routes: Routes = [
  { path: 'survey/:id', 
    component:SurveyComponent,
  },
  { path: 'response', 
    component:ResponseComponent,
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
