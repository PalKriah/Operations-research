import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SimplexSolverComponent } from './components/simplex-solver/simplex-solver.component';


const routes: Routes = [
  { path: '', component: SimplexSolverComponent },
  { path: 'simplex', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
