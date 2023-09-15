/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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

import Grid from "@oxygen-ui/react/Grid";
import { AlertInterface, AlertLevels, IdentifiableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { Field, Form } from "@wso2is/form";
import { EmphasizedSegment, PageLayout } from "@wso2is/react-components";
import React, { FC, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { AppConstants, history } from "../../core";
import { Checkbox, CheckboxProps } from "semantic-ui-react";
import { updateAdminAdvisoryBannerConfiguration, useAdminAdvisoryBannerConfigs } from "../api";
import { AdminAdvisoryBannerConfigurationInterface } from "../models";

/**
 * Props for the Admin Session Advisory Banner page.
 */
type AdmindvisoryBannerEditPageInterface = IdentifiableComponentInterface;

interface AdminAdvisoryConfigurationInterface {
    /**
     * Flag to enable the banner.
     */
    enableBanner: boolean;
    /**
     * Banner content.
     */
    bannerContent: string;
}

const FORM_ID: string = "governance-connectors-self-registration-form";

/**
 * Admin Advisory Banner Edit page.
 *
 * @param props - Props injected to the component.
 * @returns Admin Advisory Banner Edit page.
 */
export const AdminSessionAdvisoryBannerEditPage: FC<AdmindvisoryBannerEditPageInterface> = (
    props: AdmindvisoryBannerEditPageInterface
): ReactElement => {

    const { t } = useTranslation();
    const dispatch: Dispatch = useDispatch();

    const { [ "data-componentid" ]: componentId } = props;

    const [ 
        adminAdvisoryBannerConfigs, 
        setAdminAdvisoryBannerConfigs 
    ] = useState<AdminAdvisoryBannerConfigurationInterface>(undefined);

    const {
        data: adminAdvisoryConfigs,
        isLoading: isAdminAdvisoryConfigsGetRequestLoading,
        error: adminAdvisoryConfigsGetRequestError,
    } = useAdminAdvisoryBannerConfigs();

    useEffect(() => {
        if (!adminAdvisoryConfigs) {

            return;
        }

        setAdminAdvisoryBannerConfigs(adminAdvisoryConfigs);
    }, [ adminAdvisoryConfigs ]);

    useEffect(() => {
        if (!adminAdvisoryConfigsGetRequestError) {

            return;
        }

        dispatch(addAlert<AlertInterface>({
            description: t("extensions:develop.branding.notifications.fetch.genericError.description"),
            level: AlertLevels.ERROR,
            message: t("extensions:develop.branding.notifications.fetch.genericError.message")
        }));
    }, [ adminAdvisoryConfigsGetRequestError ]);

    /**
     * Handles the back button click event.
     */
    const handleBackButtonClick = (): void => {
        history.push(AppConstants.getPaths().get("ADMIN_ADVISORY_BANNER"));
    }

    const handleToggleChange = (event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
        event.preventDefault();
        
        const configs: AdminAdvisoryConfigurationInterface = {
            enableBanner: data.checked,
            bannerContent: adminAdvisoryConfigs?.bannerContent
        }

        updateAdminAdvisoryBannerConfig(configs, true);
    };

    const handleBannerContentUpdate = (values: Record<string, unknown>) => {
        const configs: AdminAdvisoryConfigurationInterface = {
            enableBanner: adminAdvisoryBannerConfigs.enableBanner,
            bannerContent: values?.adminAdvisoryBannerContent.toString()
        }

        updateAdminAdvisoryBannerConfig(configs, false);
    }

    const updateAdminAdvisoryBannerConfig = (configs: AdminAdvisoryConfigurationInterface, 
        isFeatureStatus: boolean): void => {

        updateAdminAdvisoryBannerConfiguration(configs).then(() => {
            setAdminAdvisoryBannerConfigs(configs);

            if (isFeatureStatus) {
                if (configs.enableBanner) {
                    dispatch(addAlert<AlertInterface>({
                        description: t("console:manage.features.serverConfigs.adminAdvisory.notifications." +
                        "enableAdminAdvisoryBanner.success.description"),
                        level: AlertLevels.SUCCESS,
                        message: t("console:manage.features.serverConfigs.adminAdvisory.notifications." +
                        "enableAdminAdvisoryBanner.success.message")
                    }));
                } else {
                    dispatch(addAlert<AlertInterface>({
                        description: t("console:manage.features.serverConfigs.adminAdvisory.notifications." +
                        "disbleAdminAdvisoryBanner.success.description"),
                        level: AlertLevels.SUCCESS,
                        message: t("console:manage.features.serverConfigs.adminAdvisory.notifications." +
                        "disbleAdminAdvisoryBanner.success.message")
                    }));
                }
                
                return;
            }

            dispatch(addAlert<AlertInterface>({
                description: t("console:manage.features.serverConfigs.adminAdvisory.notifications." +
                    "updateConfigurations.success.description"),
                level: AlertLevels.SUCCESS,
                message: t("console:manage.features.serverConfigs.adminAdvisory.notifications." +
                "updateConfigurations.success.message")
            }));
        }).catch((error) => {
            if (error.response && error.response.data && error.response.data.description) {
                dispatch(addAlert<AlertInterface>({
                    description: error.response.data.description,
                    level: AlertLevels.ERROR,
                    message: t("console:manage.features.serverConfigs.adminAdvisory.notifications." +
                    "updateConfigurations.error.message")
                }));
            }

            dispatch(addAlert<AlertInterface>({
                description: t("console:manage.features.serverConfigs.adminAdvisory.notifications." +
                    "updateConfigurations.genericError.description"),
                level: AlertLevels.ERROR,
                message: t("console:manage.features.serverConfigs.adminAdvisory.notifications." +
                    "updateConfigurations.genericError.message")
            }));
        });
    };

    return (
        <PageLayout
            title={ t("console:manage.features.serverConfigs.adminAdvisory.configurationEditSection.pageHeading") }
            pageTitle={ t("console:manage.features.serverConfigs.adminAdvisory.configurationEditSection.pageHeading") }
            description={ t("console:manage.features.serverConfigs.adminAdvisory.configurationEditSection.pageSubheading") }
            data-componentid={ `${ componentId }-page-layout` }
            backButton={ {
                "data-testid": `${ componentId }-page-back-button`,
                onClick: handleBackButtonClick,
                text: t("console:manage.features.serverConfigs.adminAdvisory.configurationEditSection.backButtonLabel")
            } }
            bottomMargin={ false }
            contentTopMargin={ true }
            pageHeaderMaxWidth={ true }
            isLoading={ isAdminAdvisoryConfigsGetRequestLoading }
        >
            <Checkbox
                label={ adminAdvisoryBannerConfigs?.enableBanner 
                    ? t("console:manage.features.serverConfigs.adminAdvisory.configurationSection.enabled")
                    : t("console:manage.features.serverConfigs.adminAdvisory.configurationSection.enabled")
                }
                toggle
                onChange={ handleToggleChange }
                checked={ adminAdvisoryBannerConfigs?.enableBanner }
                readOnly={ null }
                data-componentid={ `${ componentId }-enable-toggle` }
            />
            <Grid className={ "mt-5" }>
                <Grid>
                    <EmphasizedSegment className="form-wrapper" padded={ "very" }>
                        <Form
                            id={ FORM_ID }
                            initialValues={ adminAdvisoryBannerConfigs }
                            uncontrolledForm={ false }
                            validate={ null }
                            onSubmit={ (values: Record<string, unknown>) => handleBannerContentUpdate(values) }
                        >
                            <Field.Textarea
                                ariaLabel="Admin Advisory Banner Content"
                                name="adminAdvisoryBannerContent"
                                label={ t("console:manage.features.serverConfigs.adminAdvisory.configurationEditSection.form.bannerContent.label") }
                                required={ false }
                                placeholder={ 
                                    t("console:manage.features.serverConfigs.adminAdvisory.configurationEditSection.form.bannerContent.placeholder") 
                                }
                                value={ adminAdvisoryBannerConfigs?.bannerContent }
                                readOnly={ !adminAdvisoryBannerConfigs?.enableBanner }
                                maxLength={ 300 }
                                minLength={ 3 }
                                data-componentid={ `${ componentId }-content` }
                                width={ 16 }
                                hint={ t("console:manage.features.serverConfigs.adminAdvisory.configurationEditSection.form.bannerContent.hint") }
                            />
                            <Field.Button
                                form={ FORM_ID }
                                size="small"
                                buttonType="primary_btn"
                                ariaLabel="Update button"
                                name="update-button"
                                data-componentid={ `${ componentId }-update-button` }
                                label={ t("common:update") }
                                hidden={ !adminAdvisoryBannerConfigs?.enableBanner }
                            />
                        </Form>
                    </EmphasizedSegment>
                </Grid>
            </Grid>
        </PageLayout>
    );
}

/**
 * Default props for the component.
 */
AdminSessionAdvisoryBannerEditPage.defaultProps = {
    "data-componentid": "admin-advisory-edit"
};

/**
 * A default export was added to support React.lazy.
 * TODO: Change this to a named export once react starts supporting named exports for code splitting.
 * @see {@link https://reactjs.org/docs/code-splitting.html#reactlazy}
 */
export default AdminSessionAdvisoryBannerEditPage;
