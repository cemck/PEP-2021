import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'modal-new-scan',
    loadChildren: () => import('./pages/modal-new-scan/modal-new-scan.module').then( m => m.ModalNewScanPageModule)
  },
  {
    path: 'modal-vr-qr-link',
    loadChildren: () => import('./pages/modal-vr-qr-link/modal-vr-qr-link.module').then( m => m.ModalVrQrLinkPageModule)
  },
  {
    path: 'modal-scan-result',
    loadChildren: () => import('./pages/modal-scan-result/modal-scan-result.module').then( m => m.ModalScanResultPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }