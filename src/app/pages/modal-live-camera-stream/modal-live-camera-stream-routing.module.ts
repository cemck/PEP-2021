import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalLiveCameraStreamPage } from './modal-live-camera-stream.page';

const routes: Routes = [
  {
    path: '',
    component: ModalLiveCameraStreamPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalLiveCameraStreamPageRoutingModule {}
