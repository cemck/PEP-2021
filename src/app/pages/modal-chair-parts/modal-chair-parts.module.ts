import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalChairPartsPageRoutingModule } from './modal-chair-parts-routing.module';

import { ModalChairPartsPage } from './modal-chair-parts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalChairPartsPageRoutingModule
  ],
  declarations: [ModalChairPartsPage]
})
export class ModalChairPartsPageModule {}
