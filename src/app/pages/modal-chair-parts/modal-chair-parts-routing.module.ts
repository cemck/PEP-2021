import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalChairPartsPage } from './modal-chair-parts.page';

const routes: Routes = [
  {
    path: '',
    component: ModalChairPartsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalChairPartsPageRoutingModule {}
