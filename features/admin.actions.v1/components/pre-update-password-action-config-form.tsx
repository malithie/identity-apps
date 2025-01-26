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

import Box from "@oxygen-ui/react/Box";
import Button from "@oxygen-ui/react/Button";
import Divider from "@oxygen-ui/react/Divider";
import FormLabel from "@oxygen-ui/react/FormLabel";
import Skeleton from "@oxygen-ui/react/Skeleton";
import Typography from "@oxygen-ui/react/Typography";
import { FeatureAccessConfigInterface, useRequiredScopes } from "@wso2is/access-control";
import { AppState } from "@wso2is/admin.core.v1";
import { IdentifiableComponentInterface } from "@wso2is/core/models";
import {
    FinalForm,
    FinalFormField,
    FormRenderProps,
    FormSpy,
    SelectFieldAdapter
} from "@wso2is/form";
import { DropdownChild } from "@wso2is/forms";
import { EmphasizedSegment } from "@wso2is/react-components";
import { AxiosError } from "axios";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { ActionCertificatesListComponent } from "./certificate/action-certificate-list";
import CommonActionConfigForm from "./common-action-config-form";
import createAction from "../api/create-action";
import updateAction from "../api/update-action";
import useGetActionById from "../api/use-get-action-by-id";
import useGetActionsByType from "../api/use-get-actions-by-type";
import { ActionsConstants } from "../constants/actions-constants";
import {
    ActionConfigFormPropertyInterface,
    AuthenticationPropertiesInterface,
    AuthenticationType, PasswordFormat,
    PreUpdatePasswordActionConfigFormPropertyInterface,
    PreUpdatePasswordActionInterface, PreUpdatePasswordActionUpdateInterface
} from "../models/actions";
import "./pre-update-password-action-config-form.scss";
import { useHandleError, useHandleSuccess } from "../util/alert-util";
import { validateActionCommonFields } from "../util/form-field-util";

/**
 * Prop types for the action configuration form component.
 */
interface PreUpdatePasswordActionConfigFormInterface extends IdentifiableComponentInterface {
    /**
     * Action's initial values.
     */
    initialValues: PreUpdatePasswordActionConfigFormPropertyInterface;
    /**
     * Flag for loading state.
     */
    isLoading?: boolean;
    /**
     * Action Type of the Action.
     */
    actionTypeApiPath: string;
    /**
     * Specifies action creation state.
     */
    isCreateFormState: boolean;
}

const PreUpdatePasswordActionConfigForm: FunctionComponent<PreUpdatePasswordActionConfigFormInterface> = ({
    initialValues,
    isLoading,
    actionTypeApiPath,
    isCreateFormState,
    ["data-componentid"]: _componentId = "pre-update-password-action-config-form"
}: PreUpdatePasswordActionConfigFormInterface): ReactElement => {

    const actionsFeatureConfig: FeatureAccessConfigInterface = useSelector(
        (state: AppState) => state.config.ui.features.actions);
    const [ isAuthenticationUpdateFormState, setIsAuthenticationUpdateFormState ] = useState<boolean>(false);
    const [ authenticationType, setAuthenticationType ] = useState<AuthenticationType>(null);
    const [ isSubmitting, setIsSubmitting ] = useState<boolean>(false);
    const [ PEMValue, setPEMValue ] = useState<string>(undefined);

    const { t } = useTranslation();

    const handleSuccess: (operation: string) => void = useHandleSuccess();
    const handleError: (error: AxiosError, operation: string) => void = useHandleError();

    const hasActionUpdatePermissions: boolean = useRequiredScopes(actionsFeatureConfig?.scopes?.update);
    const hasActionCreatePermissions: boolean = useRequiredScopes(actionsFeatureConfig?.scopes?.create);

    const {
        mutate: mutateActions
    } = useGetActionsByType(actionTypeApiPath);

    const {
        mutate: mutateAction
    } = useGetActionById(actionTypeApiPath, initialValues?.id);

    /**
     * The following useEffect is used to set the current Action Authentication Type.
     */
    useEffect(() => {
        if (!initialValues?.id) {
            setIsAuthenticationUpdateFormState(true);
        } else {
            setAuthenticationType(initialValues.authenticationType as AuthenticationType);
            setIsAuthenticationUpdateFormState(false);
        }
    }, [ initialValues ]);

    useEffect(() => {
        if (initialValues?.certificate) {
            setPEMValue(initialValues.certificate);
        } else {
            setPEMValue(null);
        }
    }, [ initialValues ]);

    const renderLoadingPlaceholders = (): ReactElement => (
        <Box className="placeholder-box">
            <Skeleton variant="rectangular" height={ 7 } width="30%" />
            <Skeleton variant="rectangular" height={ 28 } />
            <Skeleton variant="rectangular" height={ 7 } width="90%" />
            <Skeleton variant="rectangular" height={ 7 } />
        </Box>
    );

    const getFieldDisabledStatus = (): boolean => {
        if (isCreateFormState) {
            return !hasActionCreatePermissions;
        } else {
            return !hasActionUpdatePermissions;
        }
    };

    const validateForm = (values: PreUpdatePasswordActionConfigFormPropertyInterface):
        Partial<PreUpdatePasswordActionConfigFormPropertyInterface> => {

        const customError: Partial<PreUpdatePasswordActionConfigFormPropertyInterface> = {};

        // Call the utility validate function
        const commonFieldError: Partial<ActionConfigFormPropertyInterface> = validateActionCommonFields(values, {
            authenticationType: authenticationType,
            isAuthenticationUpdateFormState: isAuthenticationUpdateFormState,
            isCreateFormState: isCreateFormState
        }, t);

        if (!values?.passwordSharing) {
            customError.passwordSharing = t("actions:fields.passwordSharing.format.validations") as PasswordFormat;
        }

        return { ...commonFieldError, ...customError };

    };

    const handleSubmit = (
        values: PreUpdatePasswordActionConfigFormPropertyInterface,
        changedFields: PreUpdatePasswordActionConfigFormPropertyInterface) => {
        const authProperties: Partial<AuthenticationPropertiesInterface> = {};

        if (isAuthenticationUpdateFormState || isCreateFormState) {
            switch (values.authenticationType) {
                case AuthenticationType.BASIC:
                    authProperties.username = values.usernameAuthProperty;
                    authProperties.password = values.passwordAuthProperty;

                    break;
                case AuthenticationType.BEARER:
                    authProperties.accessToken = values.accessTokenAuthProperty;

                    break;
                case AuthenticationType.API_KEY:
                    authProperties.header = values.headerAuthProperty;
                    authProperties.value = values.valueAuthProperty;

                    break;
                case AuthenticationType.NONE:
                    break;
                default:
                    break;
            }
        }

        if (isCreateFormState) {
            const actionValues: PreUpdatePasswordActionInterface = {
                endpoint: {
                    authentication: {
                        properties: authProperties,
                        type: values.authenticationType as AuthenticationType
                    },
                    uri: values.endpointUri
                },
                name: values.name,
                passwordSharing: {
                    ...(PEMValue ? { certificate: PEMValue } : {}),
                    format: values.passwordSharing
                }
            };

            setIsSubmitting(true);
            createAction(actionTypeApiPath, actionValues)
                .then(() => {
                    handleSuccess(ActionsConstants.CREATE);
                    mutateActions();
                })
                .catch((error: AxiosError) => {
                    handleError(error, ActionsConstants.CREATE);
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        } else {
            // Updating the action
            const updatingValues: PreUpdatePasswordActionUpdateInterface = {
                endpoint: isAuthenticationUpdateFormState || changedFields?.endpointUri ? {
                    authentication: isAuthenticationUpdateFormState ? {
                        properties: authProperties,
                        type: values.authenticationType as AuthenticationType
                    } : undefined,
                    uri: changedFields?.endpointUri ? values.endpointUri : undefined
                } : undefined,
                name: changedFields?.name ? values.name : undefined,
                passwordSharing: changedFields?.passwordSharing ? {
                    format: values.passwordSharing
                } : undefined
            };

            setIsSubmitting(true);
            updateAction(actionTypeApiPath, initialValues.id, updatingValues)
                .then(() => {
                    handleSuccess(ActionsConstants.UPDATE);
                    setIsAuthenticationUpdateFormState(false);
                    mutateAction();
                })
                .catch((error: AxiosError) => {
                    handleError(error, ActionsConstants.UPDATE);
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        }
    };

    const renderFormFields = (): ReactElement => {

        if (isLoading) {
            return renderLoadingPlaceholders();
        }

        return (
            <>
                <CommonActionConfigForm
                    initialValues={ initialValues }
                    isCreateFormState={ isCreateFormState }
                    onAuthenticationTypeChange={ (updatedValue: AuthenticationType, change: boolean) => {
                        setAuthenticationType(updatedValue);
                        setIsAuthenticationUpdateFormState(change);
                    } } />
                <Divider className="divider-container" />
                <Typography variant="h6" className="password-sharing-label">
                    { t("actions:fields.passwordSharing.label") }
                </Typography>
                <FinalFormField
                    key="passwordSharing"
                    className="select-field-container"
                    width={ 16 }
                    FormControlProps={ {
                        margin: "dense"
                    } }
                    ariaLabel="passwordsharing"
                    required={ true }
                    data-componentid={ `${_componentId}-password-sharing-type-dropdown` }
                    name="passwordSharing"
                    type={ "dropdown" }
                    displayEmpty={ true }
                    label={ t("actions:fields.passwordSharing.format.label") }
                    placeholder={ t("actions:fields.passwordSharing.format.placeholder") }
                    component={ SelectFieldAdapter }
                    maxLength={ 100 }
                    minLength={ 0 }
                    options={
                        [ ...ActionsConstants.PASSWORD_SHARING_TYPES.map(
                            (option: DropdownChild) => ({
                                text: option.text,
                                value: option.value
                            }))
                        ]
                    }
                    clearable={ true }
                />
                <FormLabel className="certificate-label" >
                    { t("actions:fields.passwordSharing.certificate.label") }
                </FormLabel>
                <ActionCertificatesListComponent
                    updatePEMValue={ (val: string) => {
                        setPEMValue(val);
                    } }
                    updateSubmit={ (val: boolean) => {
                        setIsSubmitting(val);
                    } }
                    isCreateFormState={ isCreateFormState }
                    certificate={ PEMValue }
                    actionTypeApiPath={ actionTypeApiPath }
                    actionId={ initialValues?.id }
                />
            </>
        );
    };

    return (
        <FinalForm
            onSubmit={ (values: PreUpdatePasswordActionConfigFormPropertyInterface, form: any) => {
                handleSubmit(values, form.getState().dirtyFields);
            }
            }
            validate={ validateForm }
            initialValues={ initialValues }
            render={ ({ handleSubmit, form }: FormRenderProps) => (
                <form onSubmit={ handleSubmit }>
                    <EmphasizedSegment
                        className="form-wrapper"
                        padded={ "very" }
                        data-componentid={ `${_componentId}-section` }
                    >
                        <div className="form-container with-max-width">
                            { renderFormFields() }
                            { !isLoading && (
                                <Button
                                    size="medium"
                                    variant="contained"
                                    onClick={ handleSubmit }
                                    className={ "button-container" }
                                    data-componentid={ `${_componentId}-primary-button` }
                                    loading={ isSubmitting }
                                    disabled={ getFieldDisabledStatus() }
                                >
                                    {
                                        isCreateFormState
                                            ? t("actions:buttons.create")
                                            : t("actions:buttons.update")
                                    }
                                </Button>
                            ) }
                        </div>
                    </EmphasizedSegment>
                    <FormSpy
                        subscription={ { values: true } }
                    >
                        { ({ values }: { values: ActionConfigFormPropertyInterface }) => {
                            if (!isAuthenticationUpdateFormState) {
                                form.change("authenticationType",
                                    initialValues?.authenticationType);
                                switch (authenticationType) {
                                    case AuthenticationType.BASIC:
                                        delete values.usernameAuthProperty;
                                        delete values.passwordAuthProperty;

                                        break;
                                    case AuthenticationType.BEARER:
                                        delete values.accessTokenAuthProperty;

                                        break;
                                    case AuthenticationType.API_KEY:
                                        delete values.headerAuthProperty;
                                        delete values.valueAuthProperty;

                                        break;
                                    default:
                                        break;
                                }
                            }

                            // Clear inputs of property field values of other authentication types.
                            switch (authenticationType) {
                                case AuthenticationType.BASIC:
                                    delete values.accessTokenAuthProperty;
                                    delete values.headerAuthProperty;
                                    delete values.valueAuthProperty;

                                    break;
                                case AuthenticationType.BEARER:
                                    delete values.usernameAuthProperty;
                                    delete values.passwordAuthProperty;
                                    delete values.headerAuthProperty;
                                    delete values.valueAuthProperty;

                                    break;
                                case AuthenticationType.API_KEY:
                                    delete values.usernameAuthProperty;
                                    delete values.passwordAuthProperty;
                                    delete values.accessTokenAuthProperty;

                                    break;
                                case AuthenticationType.NONE:
                                    delete values.usernameAuthProperty;
                                    delete values.passwordAuthProperty;
                                    delete values.headerAuthProperty;
                                    delete values.valueAuthProperty;
                                    delete values.accessTokenAuthProperty;

                                    break;
                                default:

                                    break;
                            }

                            return null;
                        } }
                    </FormSpy>
                </form>
            ) }
        >
        </FinalForm>
    );
};

export default PreUpdatePasswordActionConfigForm;