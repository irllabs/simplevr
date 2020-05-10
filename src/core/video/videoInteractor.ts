import { Injectable } from '@angular/core';
import apiService from 'data/api/apiService';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class VideoInteractor {
  uploadVideo(videoFile: File): Observable<any> {
    return null;
  }
}
