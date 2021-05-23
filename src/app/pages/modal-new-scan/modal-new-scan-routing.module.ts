import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalNewScanPage } from './modal-new-scan.page';

const routes: Routes = [
  {
    path: '',
    component: ModalNewScanPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalNewScanPageRoutingModule {}
