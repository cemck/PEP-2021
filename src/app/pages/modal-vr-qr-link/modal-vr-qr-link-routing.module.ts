import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalVrQrLinkPage } from './modal-vr-qr-link.page';

const routes: Routes = [
  {
    path: '',
    component: ModalVrQrLinkPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalVrQrLinkPageRoutingModule {}
