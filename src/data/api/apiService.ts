import { Headers, Http, RequestOptions, ResponseContentType } from '@angular/http';

import Axios from 'axios';

import Api from 'data/api/api';
import userService from 'data/user/userService';
import { Observable } from 'rxjs/Observable';
import { BASE_URL, GOOGLE_API_KEY } from 'ui/common/constants';
import { ENV } from '../../config/environment';

// const URL_SHORTENER_URL: string = `https://www.googleapis.com/urlshortener/v1/url`;
const URL_SHORTENER_URL: string = `https://firebasedynamiclinks.googleapis.com/v1/shortLinks`;

class ApiService implements Api {
	public async loadBinaryData(url: string) {
		const response = await Axios.get(url, {
			responseType: 'arraybuffer'
		});
		return response.data;
	}

	// GET /admin_groups/groupName
	public async getAllProjectsInGroup(groupId: string) {
		const URL: string = `${BASE_URL}/admin_groups/${groupId}/`;

		const response = await Axios.get(URL);
		return response.data.map(response => response.json());
	}

	public async setProjectInGroup(groupId: string, projectId: string, isIn: boolean, projectType: string) {
		const URL: string = `${BASE_URL}/user_groups/${groupId}/`;
		const payloadBody = { projectId, isIn, projectType };

		const response = await Axios.put(URL, payloadBody)
		return response.data.map(response => response.json());
	}

	public async getGroup(groupId: string) {
		const URL: string = `${BASE_URL}/user_groups/${groupId}/`;

		const reponse = await Axios.get(URL)
		return reponse.data.map(response => response.json());
	}

	public getRequestOptions(headerData = {}): RequestOptions {
		userService.authorize((name, val) => {
		headerData[name] = val;
		});

		return new RequestOptions({
		withCredentials: true,
		headers: new Headers(headerData),
		});
	}

	public async downloadMedia(mediaUrl: string, responseType: any = ResponseContentType.Blob) {
		const reponse = await Axios.get(encodeURI(mediaUrl), { responseType });
		return reponse.data.map(response => response.blob());
	}

	public async getShortenedUrl(url: string) {
		const reponse = await Axios
		.post(`${URL_SHORTENER_URL}?key=${ENV.firebase.apiKey}`, {
			"dynamicLinkInfo": {
			"link": url,
			"dynamicLinkDomain": ENV.firebase.dynamicLinkDomain
			},
			"suffix": {
			"option": "SHORT"
			}
		});
		return reponse.data.shortLink;
	}

	// public getShortenedUrl(url: string): Observable<any> {
	//   const payload= {
	//     "longUrl": url
	//   };
	//   return this.http.post(`${URL_SHORTENER_URL}?key=${GOOGLE_API_KEY}`, payload)
	//     .map(response => response.json())
	//     .map(responseJson => responseJson.id)
	// }
}
export default new ApiService();
