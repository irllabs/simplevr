import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import projectInteractor from 'core/project/projectInteractor';
import userInteractor from 'core/user/userInteractor';

import apiService from 'data/api/apiService';
import * as QRCode from 'qrcode';
import { Observable } from 'rxjs/Observable';
import { copyToClipboard } from 'ui/editor/util/clipboard';
import { getShareableLink } from 'ui/editor/util/publicLinkHelper';
import { Project } from 'data/project/projectModel';

@Component({
	selector: 'shareable-modal',
	styleUrls: ['./shareable-modal.scss'],
	templateUrl: './shareable-modal.html',
})
export class ShareableModal {

	@Output() onClose = new EventEmitter();
	@Input() shareableData;
	@ViewChild('qrCodeElem') qrCodeElem;
	private isPublic = false;
	private publicLink = '';
	private projectName = '';
	private notificationIsVisible = false;

	async ngOnInit() {
		const projectId = this.shareableData.projectId;

		const response = await projectInteractor.getProjectData(projectId)
		const projectData = response.data() as Project;

		const publicLink = getShareableLink(projectId);

		this.isPublic = projectData.isPublic;
		this.projectName = projectData.name;

		const link = this.isPublic ? publicLink : null;

		let shortenedUrl: string;
		if (link) {
			shortenedUrl = await apiService.getShortenedUrl(link);
		}

		this.publicLink = shortenedUrl;
		if (this.publicLink) {
			this.setQRCode(this.publicLink);
		}
	}

	public closeModal($event, isAccepted: boolean) {
		this.onClose.emit({ isAccepted });
	}

	public projectIsPublic(): boolean {
		return this.isPublic;
	}

	public onCheckboxChange() {
		const projectId = this.shareableData.projectId;

		this.isPublic = !this.isPublic;

		projectInteractor.updateSharableStatus(projectId, this.isPublic)
			.then(() => {
				const publicLink = getShareableLink(projectId);

				return this.isPublic ? publicLink : null;
			})
			.then(publicLink => publicLink ? apiService.getShortenedUrl(publicLink) : null)
			.then(
				(shortenedUrl) => {
					this.publicLink = shortenedUrl;
					if (this.publicLink) {
						this.setQRCode(this.publicLink);
					}
				},
				error => console.error('getShortUrl error', error),
			);
	}

	setQRCode(link: string) {
		QRCode.toCanvas(
			this.qrCodeElem.nativeElement,
			link,
			(error) => error ? console.error(error) : console.log('generated QR'),
		);
	}

	onPublicLinkClick() {
		copyToClipboard(this.publicLink)
			.then(() => {
				this.notificationIsVisible = true;
				setTimeout(() => this.notificationIsVisible = false, 2000);
			})
			.catch(error => console.log('copyToClipboard error', error));
	}

}
