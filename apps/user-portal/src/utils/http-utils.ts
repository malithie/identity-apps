/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { OPConfigurationUtil } from "@wso2is/authentication";
import * as ApplicationConstants from "../constants/application-constants";
import { history } from "../helpers";
import { store } from "../store";
import { hideGlobalLoader, showGlobalLoader } from "../store/actions";
import { hasLoginPermission } from "./authenticate-util";

/**
 * Callback to be fired on every Http request start.
 */
export const onHttpRequestStart = (): void => {
    store.dispatch(showGlobalLoader());
};

/**
 * Callback to be fired on every Http request success.
 *
 * @param response - Http response.
 */
export const onHttpRequestSuccess = (): void => {
    // TODO: Handle any conditions required on request success.
};

/**
 * Set up the http client by registering the callback functions.
 */
const endUserSessionWithoutLoops = (): void => {
    if (!sessionStorage.getItem(ApplicationConstants.AUTH_ERROR_TIME)) {
        sessionStorage.setItem(ApplicationConstants.AUTH_ERROR_TIME, new Date().getTime().toString());
    } else {
        const currentTime = new Date().getTime();
        const errorTime = parseInt(sessionStorage.getItem(ApplicationConstants.AUTH_ERROR_TIME), 10);
        if (currentTime - errorTime >= 10000) {
            sessionStorage.setItem(ApplicationConstants.AUTH_ERROR_TIME, new Date().getTime().toString());
            history.push(APP_LOGOUT_PATH);
        } else {
            sessionStorage.setItem(ApplicationConstants.AUTH_ERROR_TIME, new Date().getTime().toString());
            return;
        }
    }
};


/**
 * Callback to be fired on every Http request error. The error
 * codes are evaluated necessary actions are being taken.
 *
 * @remarks
 * Axios throws a generic `Network Error` for 401 errors.
 * As a temporary solution, a check to see if an error code
 * is available has been used.
 * @see {@link https://github.com/axios/axios/issues/383}
 *
 * @param error - Http error.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const onHttpRequestError = (error: any): null => {
    // Terminate the session if the token endpoint returns a bad request(400)
    // The token binding feature will return a 400 status code when the session
    // times out.
    if (error.response && error.response.request
        && error.response.request.responseURL
        && error.response.request.responseURL === OPConfigurationUtil.getTokenEndpoint()) {

        if (error.response.status === 400) {
            history.push(APP_LOGOUT_PATH);
            return;
        }
    }

    // If the user doesn't have login permission, redirect to login error page.
    if (!hasLoginPermission()) {
        history.push(ApplicationConstants.LOGIN_ERROR_PAGE_PATH);
        return;
    }

    // Terminate the session if the requests return an un-authorized status code (401)
    // or a forbidden status code (403). NOTE: Axios is unable to handle 401 errors.
    // `!error.response` will usually catch the `401` error. Check the link in the doc comment.
    if (!error.response || error.response.status === 403 || error.response.status === 401) {
        endUserSessionWithoutLoops();
    }
};

/**
 * Callback to be fired on every Http request finish.
 */
export const onHttpRequestFinish = (): void => {
    store.dispatch(hideGlobalLoader());
};
