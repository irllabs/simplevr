import React from 'react';
import * as QRCode from 'qrcode';

import './shareable-modal.scss';

import projectInteractor from 'core/project/projectInteractor';
import { Project } from 'data/project/projectModel';
import apiService from 'data/api/apiService';
import { copyToClipboard } from 'ui/editor/util/clipboard';
import { getShareableLink } from 'ui/editor/util/publicLinkHelper';
import Checkbox from 'root/components/checkbox/checkbox';

interface ShareableModalProps {
	onClose: () => void;
	shareableData: any;
}

interface ShareableModalState {
	projectName: string;
	notificationIsVisible: boolean;
	publicLink: string;
	isPublic: boolean;
}

export default class ShareableModal extends React.Component<ShareableModalProps, ShareableModalState> {
	private qrCodeElem = React.createRef<HTMLCanvasElement>();

	constructor(props: ShareableModalProps) {
		super(props);

		this.state = {
			projectName: '',
			notificationIsVisible: false,
			publicLink: '',
			isPublic: false,
		}

		this.onCheckboxChange = this.onCheckboxChange.bind(this);
		this.onPublicLinkClick = this.onPublicLinkClick.bind(this);
	}

	public async componentDidMount() {
		const projectId = this.props.shareableData.projectId;

		const response = await projectInteractor.getProjectData(projectId)
		const projectData = response.data() as Project;

		const publicLink = getShareableLink(projectId);

		this.setState({
			isPublic: projectData.isPublic,
			projectName: projectData.name
		});

		const link = projectData.isPublic ? publicLink : null;

		let shortenedUrl: string;
		if (link) {
			shortenedUrl = await apiService.getShortenedUrl(link);
		}

		this.setState({
			publicLink: shortenedUrl,
		}, () => {
			if (this.state.publicLink) {
				this.setQRCode(this.state.publicLink);
			}
		});
	}

	public render() {
		return (
			<div className="modal__content">
				<div className="modal__content-header">
					Shareable settings
				</div>

				<div className="modal__content-body">
					<div className="public-option-row public-option__text-block">
						<span className="public-option-row__label">Make public</span>
						<Checkbox
							initialValue={this.projectIsPublic()}
							onChange={this.onCheckboxChange}
							disabled={false}>
						</Checkbox>
					</div>

					{this.projectIsPublic() &&
					<div>
						<p className="public-option__text-block">
							Your project titled "{this.state.projectName}" is public.
						</p>
						<p className={`public-option__copy-notification ${this.state.notificationIsVisible ? 'public-option__copy-notification--active' : ''}`}>
							Link copied to clipboard!
						</p>
						<div className="public-option__qr-code">
							<canvas ref={this.qrCodeElem}></canvas>
						</div>
						
						<div className="public-option__clipboard-text">
						<p
							className="public-option__link"
							title={this.state.publicLink}
							onClick={this.onPublicLinkClick}>
								{this.state.publicLink}
								<span>
									Click to Copy to Clipboard
								</span>
						</p>
						</div>
						
						<div className="public-option__text-block">
						<p>This means:</p>
						<ul className="public-option__explanation-list">
							<li>Other people can look at this project using the link above.</li>
							<li>Simple VR users can find this project using the search tool.</li>
							<li>Nobody else can modify this project.</li>
						</ul>
						</div>
					</div>}

					{!this.projectIsPublic() &&
					<div>
						<p className="public-option__text-block">Your project titled "{this.state.projectName}" is not public.</p>
						<p className="public-option__text-block">Only you can access this project.</p>
					</div>}

					<p
						onClick={(event) => {
							this.closeModal()
						}}
						className="modal__content-body-close">
						Close
					</p>
				</div>
			</div>
		);
	}

	private closeModal() {
		this.props.onClose();
	}

	public projectIsPublic(): boolean {
		return this.state.isPublic;
	}

	public onCheckboxChange() {
		const projectId = this.props.shareableData.projectId;

		this.setState({
			isPublic: !this.state.isPublic
		}, () => {
			projectInteractor.updateSharableStatus(projectId, this.state.isPublic)
			.then(() => {
				const publicLink = getShareableLink(projectId);

				return this.state.isPublic ? publicLink : null;
			})
			.then(publicLink => publicLink ? apiService.getShortenedUrl(publicLink) : null)
			.then(
				(shortenedUrl) => {
					this.setState({
						publicLink: shortenedUrl
					}, () => {
						if (this.state.publicLink) {
							this.setQRCode(this.state.publicLink);
						}
					});
				},
				error => console.error('getShortUrl error', error),
			);
		});
	}

	setQRCode(link: string) {
		QRCode.toCanvas(
			this.qrCodeElem.current,
			link,
			(error) => error ? console.error(error) : console.log('generated QR'),
		);
	}

	onPublicLinkClick() {
		copyToClipboard(this.state.publicLink)
			.then(() => {
				this.setState({
					notificationIsVisible: true,
				});
				setTimeout(() => {
					this.setState({
						notificationIsVisible: false,
					});
				}, 2000);
			})
			.catch(error => console.log('copyToClipboard error', error));
	}
}
