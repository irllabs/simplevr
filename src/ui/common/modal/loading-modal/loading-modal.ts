import { Component, Input } from '@angular/core';

@Component({
  selector: 'loading-modal',
  styleUrls: ['./loading-modal.scss'],
  templateUrl: './loading-modal.html',
})
export class LoadingModal {
  @Input() message: string = 'Loading your project, just a moment...';
}
