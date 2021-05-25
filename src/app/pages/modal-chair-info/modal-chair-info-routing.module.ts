import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalChairInfoPage } from './modal-chair-info.page';

const routes: Routes = [
  {
    path: '',
    component: ModalChairInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalChairInfoPageRoutingModule {}
