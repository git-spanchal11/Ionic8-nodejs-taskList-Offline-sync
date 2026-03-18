import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoadingController } from '@ionic/angular/standalone';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  private loading: HTMLIonLoadingElement | null = null;
  private requestCount = 0;

  constructor(private loadingCtrl: LoadingController) { }

  /**
   * Intercepts requests to track active request count and show/hide the loading spinner.
   */
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

  /**
   * Displays the global loading indicator if one isn't already visible.
   */
  private async showLoader() {
    if (!this.loading && this.requestCount > 0) {
      this.loading = await this.loadingCtrl.create({
        message: 'Loading...',
        spinner: 'circular'
      });
      await this.loading.present();
    }
  }

  /**
   * Dismisses the global loading indicator with a slight delay for smoother UI transitions.
   */
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
