/*<div
class="topbar__sub-row topbar__marginleft"
title="Your current story...">
<p
  [routerLink]="['/editor', {outlets: {'modal': ['story']}}]"
  class="topbar__row-label"
  [ngClass]="{'topbar__row-label-active': storyIsOpen}">
  Story
</p>
</div>*/

import React from 'react';

import StoryModal from './story-modal/story-modal';

import './story.scss';

interface UserProfileState {
	storyIsOpen: boolean;
}

export default class UserProfile extends React.Component<{}, UserProfileState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			storyIsOpen: false,
		};

		this.open = this.open.bind(this);
		this.close = this.close.bind(this);
	}

	public render() {
		return ([
			<div key='story-button' className='story-button'>
				<p onClick={this.open} className={`topbar__row-label ${this.state.storyIsOpen ? 'topbar__row-label-active' : ''}`}>
					Story
				</p>
			</div>,
			this.state.storyIsOpen &&
			<div key='story-dialog'>
				<div className='story-dialog-close-surface' onClick={this.close}/>
				<div className='story-container'>
					<div className='story-dialog'>
						{this.state.storyIsOpen && <StoryModal onClose={this.close} />}
					</div>
				</div>
			</div>
			
		]);
	}

	private open(event: React.MouseEvent<HTMLParagraphElement, MouseEvent>) {
		event.stopPropagation();
		this.setState({
			storyIsOpen: true,
		});
	}

	private close() {
		this.setState({
			storyIsOpen: false,
		});
	}
}
