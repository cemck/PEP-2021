import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalChairInfoPageRoutingModule } from './modal-chair-info-routing.module';

import { ModalChairInfoPage } from './modal-chair-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalChairInfoPageRoutingModule
  ],
  declarations: [ModalChairInfoPage]
})
export class ModalChairInfoPageModule {}
