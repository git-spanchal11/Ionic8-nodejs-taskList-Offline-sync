import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoadingController } from '@ionic/angular/standalone';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  private loading: HTMLIonLoadingElement | null = null;
  private requestCount = 0;

  constructor(private loadingCtrl: LoadingController) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.requestCount++;

    if (request.url !== '') {
      this.showLoader();
    }

    return next.handle(request).pipe(
      finalize(() => {
        this.requestCount--;
        if (this.requestCount === 0) {
          this.hideLoader();
        }
      })
    );
  }

  private async showLoader() {
    // await this.loading?.dismiss();
    // this.loading = null;
    if (!this.loading && this.requestCount > 0) {
      this.loading = await this.loadingCtrl.create({
        message: 'Loading...',
        spinner: 'circular'
      });
      await this.loading.present();
    }
  }

  private async hideLoader() {
    setTimeout(async () => {
      if (this.loading) {
        await this.loadingCtrl.getTop().then(async (loader) => {
          if (loader) {
            await loader.dismiss();
            this.loading = null;
          }
        });
      }
    }, 1000);
  }
}
