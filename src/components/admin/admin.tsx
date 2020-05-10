/* import { Component, ViewChild } from '@angular/core';
import { AdminInteractor } from 'core/admin/adminInteractor';

import { UserInteractor } from 'core/user/userInteractor';

@Component({
  selector: 'admin',
  styleUrls: ['./admin.scss'],
  templateUrl: './admin.html',
})
export class Admin {

  @ViewChild('adminUserGroups') adminUserGroupsElement;

  constructor(
	private userInteractor: UserInteractor,
	private adminInteractor: AdminInteractor,
  ) {
  }

  private hasPermission(): boolean {
	return this.userInteractor.isLoggedIn() && this.adminInteractor.isAdmin();
  }

  private onAddProject($event) {
	this.adminUserGroupsElement.onAddProject($event);
  }

}
*/
import React from 'react';

import userInteractor from 'core/user/userInteractor';
import adminInteractor from 'core/admin/adminInteractor';

import authService from 'data/authentication/authService';

import AdminUserGroups from './admin-user-groups/admin-user-groups';

import './admin.scss';

interface AdminState {
	hasPermission: boolean;
}

export default class Admin extends React.Component<{}, AdminState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			hasPermission: false,
		};
	}

	public componentDidMount() {
		authService.auth.onAuthStateChanged(this.setPermission.bind(this));
	}

	public render() {
		return (
			<div className='admin'>
				{!this.state.hasPermission &&
				<div className='admin__no-permissions'>
					Only authenticated admin users can view this page.
				</div>}

				{this.state.hasPermission &&
				<div>
					<AdminUserGroups />
				</div>}
			</div>

			/*
			<div class="admin">
				<div *ngIf="hasPermission()">
					<admin-search-explore (onAddProject)="onAddProject($event)"></admin-search-explore>
				</div>
			</div>
			*/
		);
	}

	private setPermission() {
		// isAdmin always returns false for some reason - can't continue moving Admin page to react since I'm not able to test it.

		const hasPermission = userInteractor.isLoggedIn() && adminInteractor.isAdmin();
		this.setState({
			hasPermission: hasPermission,
		});
	}
}
