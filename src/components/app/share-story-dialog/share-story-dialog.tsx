import React from 'react';
import Axios from 'axios';
import QRCode from 'qrcode';
import copy from 'copy-to-clipboard';

import './share-story-dialog.scss';

import StoryService from 'services/story';

import Checkbox from 'irl-ui/checkbox/checkbox';
import Spacer from 'irl-ui/spacer/spacer';
import BorderButton, { Variant } from 'irl-ui/border-button/border-button';
import Typography, { TypographyVariant } from 'root/irl-ui/typography/typography';

import Story from 'root/models/story-model';

import colors from 'root/styles/colors';

import { firebaseConfig } from './../../../config/firebase';

interface ShareStoryDialogProps {
	story: Story;
	onClose: () => void;
}

interface ShareStoryDialogState {
	storyThumbnail: string;
	projectIsPublic: boolean;
	publicLink: string;
}

export default class ShareStoryDialog extends React.Component<ShareStoryDialogProps, ShareStoryDialogState> {
	private qrCodeCanvas = React.createRef<HTMLCanvasElement>();

	constructor(props: ShareStoryDialogProps) {
		super(props);

		this.state = {
			storyThumbnail: '',
			projectIsPublic: this.props.story.isPublic,
			publicLink: '',
		};

		this.close = this.close.bind(this);
		this.onPublicToggle = this.onPublicToggle.bind(this);
		this.onCopyLink = this.onCopyLink.bind(this);
	}

	public async componentDidMount() {
		const storyThumbnail = await this.props.story.getThumbnail();
		this.setState({
			storyThumbnail: storyThumbnail,
		});

		if (this.props.story.isPublic) {
			this.setPublicLink();
		}
	}

	public render() {
		const storyInfoIconName = this.state.projectIsPublic ? 'public-story-icon.svg' : 'private-story-icon.svg';

		return ([
			<div key='share-story-dialog-container' className='share-story-dialog-container' id='dialog-container' onClick={this.close}>
				<div className='share-story-dialog'>
					<div className='share-story-dialog-title'>
						<div className='share-story-close-button'>
							<img src='assets/icons/cancel.svg' onClick={this.props.onClose} />
						</div>
						<div className='share-story-title'>
							<Typography variant={TypographyVariant.TEXT_LARGE}>
								Share story
							</Typography>
						</div>
					</div>
					<div className='story-info-container'>
						<div className='story-name-info'>
							<Typography variant={TypographyVariant.TEXT_SMALL} color={colors.textDaylight2}>
								{this.props.story.name}
							</Typography>
							<Spacer size={4} />
							<div className='story-public-info'>
								<img src={`assets/icons/${storyInfoIconName}`} />
								<Spacer size={2} />
								<Typography variant={TypographyVariant.TEXT_X_SMALL} color={colors.textDaylight2}>
									{this.state.projectIsPublic ? 'Public story' : 'Only visible to you'}
								</Typography>
							</div>
						</div>
						<div className='story-room-info'>
							<div className='story-dialog-thumbnail-image' style={{backgroundImage: `url(${this.state.storyThumbnail})`}} />
							<Spacer size={4} />
							<Typography variant={TypographyVariant.TEXT_X_SMALL} color={colors.textDaylight2}>
								{this.props.story.story.rooms.length} rooms
							</Typography>
						</div>
					</div>
					<div className='share-story-public-toggle'>
						<div className='share-story-public-toggle-text'>
							<img src='assets/icons/public-story-icon.svg'/>
							<Spacer size={4} />
							<Typography variant={TypographyVariant.TEXT_MEDIUM} color={colors.textDaylight2}>
								Make public
							</Typography>
						</div>
						<Checkbox value={this.state.projectIsPublic} onChange={this.onPublicToggle} enabledLabel='Yes' disabledLabel='No' />
					</div>
					<div className='public-story-info'>
						<Typography variant={TypographyVariant.TEXT_X_SMALL} color={colors.textDaylight2}>
							Public stories can be searched and viewed with a link. Only you can edit your stories.
						</Typography>
					</div>
					{this.state.projectIsPublic &&
					<div className='public-data-container'>
						<canvas ref={this.qrCodeCanvas} />
						<Typography variant={TypographyVariant.HEADING_SMALL} color={colors.textDaylight2}>
							{this.state.publicLink}
						</Typography>
						<Spacer size={24} />
						<BorderButton label='Copy link' maxWidth={true} variant={Variant.PRIMARY} onClick={this.onCopyLink} />
					</div>}

				</div>
			</div>
		]);
	}

	private onCopyLink() {
		copy(this.state.publicLink);
	}

	private close(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		if ((event.target as HTMLDivElement).id === 'dialog-container') {
			this.props.onClose();
		}
	}

	private async onPublicToggle(checked: boolean) {
		this.setState({
			projectIsPublic: checked
		}, async () => {
			await StoryService.setProjectPublicFlag(this.props.story.id, this.state.projectIsPublic);

			if (this.state.projectIsPublic) {
				this.setPublicLink();
			}
		});
	}

	private async setPublicLink() {
		const publicLink = this.generateSharableLink(this.props.story.id);
		const shortenedUrl = await this.getShortenedUrl(publicLink);

		this.setState({
			publicLink: shortenedUrl
		}, () => {
			this.setQRCode(this.state.publicLink);
		});
	}

	private setQRCode(link: string) {
		QRCode.toCanvas(this.qrCodeCanvas.current, link);
	}

	private generateSharableLink(projectId: string) {
		const baseUrl = `${location.protocol}//${location.host}`;
		const pathName = location.pathname;
		const hash = '#/editor/(view:flat)';
		const queryParams = `${'sharedproject'}=${this.encodeParam(projectId)}`;

		return `${baseUrl}${pathName}${hash}?${queryParams}`;
	}

	private encodeParam(publicProjectUrl: string) {
		const base64Params = btoa(publicProjectUrl);
		return encodeURIComponent(base64Params);
	}

	private async getShortenedUrl(url: string) {
		const URL_SHORTENER_URL: string = `https://firebasedynamiclinks.googleapis.com/v1/shortLinks`;

		const response = await Axios
			.post(`${URL_SHORTENER_URL}?key=${firebaseConfig.apiKey}`, {
				"dynamicLinkInfo": {
					"link": url,
					"dynamicLinkDomain": firebaseConfig.dynamicLinkDomain
				},
				"suffix": {
					"option": "SHORT"
				}
			});
		return response.data.shortLink;
	}
}
