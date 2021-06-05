import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalKinectPage } from './modal-kinect.page';

const routes: Routes = [
  {
    path: '',
    component: ModalKinectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalKinectPageRoutingModule {}
