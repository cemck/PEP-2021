import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { map, catchError, tap, retryWhen, delayWhen } from 'rxjs/operators';
import { AlertController, LoadingController } from '@ionic/angular';

export class Scan {
  // _id: number;
  username: string;
  id: string;
  qrcode: string;
  link: string;
  state: string;
}

export class Measurements {
  body_depth: number;
  body_width: number;
  elbow_height: number;
  lowerleg_length: number;
  shoulder_height: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScanService {
  errorAlert: HTMLIonAlertElement;
  loadingAlert: HTMLIonLoadingElement;
  username = 'cemck';
  currentScan: Scan = new Scan();
  currentMeasurements: Measurements = new Measurements();
  api_key: string = '4AQ33MGPXQMXYBMXV3BYS5XQ0DSX'

  constructor(
    private httpClient: HttpClient,
    private alertController: AlertController,
    public loadingController: LoadingController,
  ) {
    this.initLoadingAlert();
  }
  // TODO: Add method to cancel any running API call subscriptions

  createNewScan(username: string): Observable<Scan> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('x-api-key', this.api_key);
    // console.log("createNewScan() headers:", headers);

    // let body = JSON.stringify({ username });

    return this.httpClient.get<Scan>(
      'https://api.mobilescan.me/prod/v1/qrcode',
      { headers: headers }
    ).pipe(
      map((data: Scan) => {
        // console.log('Received data from /createscan: ' + JSON.stringify(data));
        this.currentScan = data;
        // this.checkScanState(data).subscribe(async (state: number) => {
        //   console.log('state from checkScanState(): ', state);
        // });
        return data;
      }), catchError(error => {
        this.presentAlert(error['status']);
        return throwError('Could not create a new scan!: ' + JSON.stringify(error));
      })
    )
  };

  checkScanState(scan: Scan): Observable<number> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('x-api-key', this.api_key);
    // console.log("got id: " + scan.id);
    let body = JSON.stringify({ ids: [scan.id] });
    // console.log("checkScanState() json body to send:", body);

    return this.httpClient.post<Scan[]>(
      'https://api.mobilescan.me/prod/v1/state',
      body,
      { headers: headers }
    ).pipe(
      map((data: Scan[]) => {
        // console.log('Received data from /check-state' + JSON.stringify(data));
        // console.log('Scan state value: ' + JSON.stringify(data[0].state));
        this.loadingAlert.present();

        if (data[0].state == null) {
          throw data[0].state;
        }
        switch (String(data[0].state)) {
          case '0':
            console.log('0 = pending - QR-Code & upload links generated, waiting for photos to be uploaded.')
            throw data[0].state;
          case '1':
            console.log('1 = running - photos uploaded and processing started')
            throw data[0].state;
          case '2':
            console.log('2 = ready - the processing of the scan is finished. Now you can call /measurement or /size endpoint to get the result.')
            return Number(data[0].state);
          case '-1':
            console.log('-1 = error - an error occured during processing. The "error" field contains a detailed message.')
            throw data[0].state;
        }
        // return Number(data[0].state);
      }),
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(res => console.log(`Did not receive scan state value 2 from API! Please complete the Virtual Retail Companion App scan process.`)),
          //restart in 5 seconds
          delayWhen(res => timer(5 * 1000))
        )
      ), catchError(error => {
        this.loadingAlert.dismiss();
        this.presentAlert(error['status']);
        return throwError('Could not check scan state!: ' + JSON.stringify(error));
      })
    )
  };

  getMeasurements(scan: Scan): Observable<Measurements> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('x-api-key', this.api_key);

    let body = JSON.stringify({ id: scan.id });
    console.log("getMeasurements() json body to send:", body);

    return this.httpClient.post<Measurements>(
      'https://api.mobilescan.me/prod/v1/extrameasurement',
      body,
      { headers: headers }
    ).pipe(
      map((data: Measurements) => {
        // console.log('Received data from /getmeasurements: ' + JSON.stringify(data));
        this.currentMeasurements = data;
        this.loadingAlert.dismiss();
        // this.checkScanState(data).subscribe(async (state: number) => {
        //   console.log('state from checkScanState(): ', state);
        // });
        return data;
      }), catchError(error => {
        this.loadingAlert.dismiss();
        this.presentAlert(error['status']);
        return throwError('Could not get measurements!: ' + JSON.stringify(error));
      })
    )
  };

  reset() {
    this.currentScan = new Scan();
    this.currentMeasurements = new Measurements();
  }

  async presentAlert(error: string) {
    this.errorAlert = await this.alertController.create({
      // cssClass: 'my-custom-class',
      header: error + ' Error',
      subHeader: 'Could not connect to API.',
      message: 'Please check your network connection.',
      buttons: ['OK']
    });

    await this.errorAlert.present();

    // const { role } = await this.alert.onDidDismiss();
    // console.log('onDidDismiss resolved with role', role);
  }

  async initLoadingAlert() {
    this.loadingAlert = await this.loadingController.create({
      // cssClass: 'my-custom-class',
      message: 'Please wait...',
      // duration: 5000,
      // translucent: true,
    });

    await this.loadingAlert.onDidDismiss().then(() => {
      console.log('Loading dismissed');
    });
  }
}
