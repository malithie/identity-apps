/**
 * Copyright (c) 2020-2025, WSO2 LLC. (https://www.wso2.com).
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

import { IdentifiableComponentInterface, TestableComponentInterface } from "@wso2is/core/models";
import React, { FunctionComponent, PropsWithChildren, ReactElement } from "react";
import { Header, Segment } from "semantic-ui-react";

/**
 * Danger zone group component Prop types.
 */
export interface DangerZoneGroupProps extends TestableComponentInterface, IdentifiableComponentInterface {
    /**
     * Danger zone section heading.
     */
    sectionHeader?: string;
    /**
     * Danger zone style class name.
     */
    className?: string;
}

/**
 * Danger zone group component.
 *
 * @param props - Props injected to the danger zone group component.
 *
 * @returns the Danger zone group component
 */
export const DangerZoneGroup: FunctionComponent<PropsWithChildren<DangerZoneGroupProps>> = (
    props: PropsWithChildren<DangerZoneGroupProps>
): ReactElement => {

    const {
        sectionHeader,
        className,
        children,
        [ "data-componentid" ]: componentId,
        [ "data-testid" ]: testId
    } = props;
    const defaultClassName = className ?? "danger-zone";

    return (
        <div className= { defaultClassName + "-group-wrapper" }>
            <Header
                as="h5"
                className="bold-text"
                data-componentid={ `${ componentId }-header` }
                data-testid={ `${ testId }-header` }
            >
                { sectionHeader }
            </Header>
            <Segment.Group
                className={ defaultClassName + "-group" }
                data-componentid={ `${ componentId }` }
                data-testid={ `${ testId }` }
            >
                { children }
            </Segment.Group>
        </div>
    );
};

/**
 * Default props for the danger zone group component.
 */
DangerZoneGroup.defaultProps = {
    "data-componentid": "danger-zone-group",
    "data-testid": "danger-zone-group"
};
