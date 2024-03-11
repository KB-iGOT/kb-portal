import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ResponseComponent } from './shared/components/response/response.component';
import { SurveyComponent } from './components/survey/survey.component';
import { ObservationComponent } from './components/observation/observation.component';

const routes: Routes = [
  { path: 'mlsurvey/:id', 
    component:SurveyComponent,
  },
  {
    path:'observation/:id/:entity',
    component:ObservationComponent
  },
  { path: 'response', 
    component:ResponseComponent,
  },
  {
    path: '',
    component: AppComponent,
  },
  {
    path: '**',
    component: ResponseComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
