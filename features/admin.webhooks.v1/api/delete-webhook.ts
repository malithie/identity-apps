/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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
 */

import { AsgardeoSPAClient, HttpClientInstance } from "@asgardeo/auth-react";
import { RequestConfigInterface } from "@wso2is/admin.core.v1/hooks/use-request";
import { store } from "@wso2is/admin.core.v1/store";
import { IdentityAppsApiException } from "@wso2is/core/exceptions";
import { HttpMethods } from "@wso2is/core/models";
import { AxiosError, AxiosResponse } from "axios";
import { WebhooksConstants } from "../constants/webhooks-constants";

const httpClient: HttpClientInstance = AsgardeoSPAClient.getInstance().httpRequest.bind(
    AsgardeoSPAClient.getInstance()
);

/**
 * Delete webhook by given webhook ID.
 *
 * @param webhookId - ID of the webhook.
 * @returns Promise containing the response.
 * @throws Throws an IdentityAppsApiException if the request fails.
 */
export const deleteWebhook = (webhookId: string): Promise<string> => {
    const requestConfig: RequestConfigInterface = {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        method: HttpMethods.DELETE,
        url: `${store.getState().config.endpoints.webhooks}/${webhookId}`
    };

    return httpClient(requestConfig)
        .then((response: AxiosResponse) => {
            if (response.status !== 204) {
                throw new IdentityAppsApiException(
                    WebhooksConstants.ERROR_MESSAGES.DELETE_WEBHOOK_INVALID_STATUS_CODE,
                    null,
                    response.status,
                    response.request,
                    response,
                    response.config
                );
            }

            return Promise.resolve(response?.data);
        })
        .catch((error: AxiosError) => {
            throw new IdentityAppsApiException(
                error.message,
                error.stack,
                error.response?.data?.code,
                error.request,
                error.response,
                error.config
            );
        });
};

export default deleteWebhook;
