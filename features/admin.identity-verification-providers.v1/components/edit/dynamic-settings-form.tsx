/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com).
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

import { TemplateDynamicForm } from "@wso2is/admin.template-core.v1/components/template-dynamic-form";
import { IdentifiableComponentInterface } from "@wso2is/core/models";
import React, { FunctionComponent, ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { IdVPEditTabMetadataInterface, IdVPTemplateInterface } from "../../models/new-models";
import useInitializeHandlers from "../../hooks/use-custom-initialize-handlers";
import useValidationHandlers from "../../hooks/use-custom-validation-handlers";

interface DynamicSettingsFormPropsInterface extends IdentifiableComponentInterface {
    tabMetadata: IdVPEditTabMetadataInterface;
    templateData: IdVPTemplateInterface;
    initialValues: Record<string, unknown>;
    isReadOnly?: boolean;
    isLoading?: boolean;
}

const DynamicSettingsForm: FunctionComponent<DynamicSettingsFormPropsInterface> = (
    {
        tabMetadata,
        templateData,
        initialValues,
        isLoading = false,
        isReadOnly = false,
        ["data-componentid"]: componentId = "idvp-edit-general-settings-form"
    }: DynamicSettingsFormPropsInterface
): ReactElement => {

    const { t } = useTranslation();
    const { customInitializers } = useInitializeHandlers();
    const { customValidations } = useValidationHandlers();

    const handleFormSubmission = (values: Record<string, unknown>): void => {
        // Do nothing
        console.log(componentId, values);

    };

    return (
        <TemplateDynamicForm
            customValidations={ customValidations }
            customInitializers={ customInitializers }
            form={ tabMetadata?.form }
            initialFormValues={ initialValues as unknown as Record<string, unknown> }
            templatePayload={ templateData?.payload as unknown as Record<string, unknown> }
            buttonText={ t("common:update") }
            onFormSubmit={ handleFormSubmission }
            isLoading={ isLoading }
            readOnly={ isReadOnly }
            data-componentid={ componentId }
        />
    );
};

export default DynamicSettingsForm;
