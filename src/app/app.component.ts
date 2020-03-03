import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'mypopup.html',
})
export class DialogOverviewExampleDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data) {
      console.log(data);
    }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private readonly http: HttpClient, public dialog: MatDialog) {}
  dataLoaded = false
  title = 'myform';
  mycountryCode = '';
  mydialCode = '';
  mycountry = '';
  signedIn: Array<{
    name?: string;
    phone?: string;
    email?: string;
    company?: string;
    jrole?: string;
    address?: string;
    salary?: number;
  }> = [];
  opencageDataApikey = '52b92da2f6ab499a89cce7c408d6d626';
  ngOnInit() {
    this.fetchCountryCode();
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '500px',
      disableClose:true,
      data: { country: this.mycountry, phone: this.mydialCode + ' - ' }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data != undefined) { this.signedIn.push(data); }
      console.log(this.signedIn)
    });
  }
  mapCountryCodeToMobile() {
    const urlToCall =
      'https://gist.githubusercontent.com/Goles/3196253/raw/9ca4e7e62ea5ad935bb3580dc0a07d9df033b451/CountryCodes.json';
    this.http
      .get(urlToCall)
      .subscribe(
        (data: Array<{ name: string; dial_code: string; code: string }>) => {
          data.forEach(mydata => {
            if (mydata.code.toLowerCase() == this.mycountryCode) {
              this.mydialCode = mydata.dial_code;
              this.mycountry = mydata.name;
            }
          });
          this.dataLoaded = true
          console.log(this.mycountry, this.mycountryCode, this.mydialCode);
        }
      ),_=>this.dataLoaded = true;
  }
  fetchCountryCode() {
    const mobileExtenstion = '';
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        (position: { coords?: { latitude: number; longitude: number } }) => {
          console.log (position.coords.latitude,position.coords.longitude)
          const url = 'https://api.opencagedata.com/geocode/v1/json';
          const params = new HttpParams()
            .set(
              'q',
              position.coords.latitude +
                encodeURI(',') +
                position.coords.longitude
            )
            .set('key', this.opencageDataApikey)
            .set('language', 'en')
            .set('no_annotations', '1');
          this.http.get(url, { params }).subscribe(
            (res: {
              results?: [{ components?: { country_code: string } }];
            }) => {
              this.mycountryCode = res.results[0].components.country_code;
              this.mapCountryCodeToMobile();
            },
            er => {
              this.mycountryCode = '';
              this.dataLoaded = true
            }
          );
        },
        error => {
          switch (error.code) {
            case 1:
              console.log('Permission Denied');
              break;
            case 2:
              console.log('Position Unavailable');
              break;
            case 3:
              console.log('Timeout');
              break;
            default:
              console.log('unknown error');
          }
          this.dataLoaded = true
        }
      );
    }
  }
}

