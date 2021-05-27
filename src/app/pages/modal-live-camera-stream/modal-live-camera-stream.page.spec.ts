import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalLiveCameraStreamPage } from './modal-live-camera-stream.page';

describe('ModalLiveCameraStreamPage', () => {
  let component: ModalLiveCameraStreamPage;
  let fixture: ComponentFixture<ModalLiveCameraStreamPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalLiveCameraStreamPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalLiveCameraStreamPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
