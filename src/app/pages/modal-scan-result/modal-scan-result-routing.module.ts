import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalScanResultPage } from './modal-scan-result.page';

const routes: Routes = [
  {
    path: '',
    component: ModalScanResultPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalScanResultPageRoutingModule {}
