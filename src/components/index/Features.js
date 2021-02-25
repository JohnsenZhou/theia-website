/********************************************************************************
 * Copyright (C) 2020 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import React from 'react'

import styled from '@emotion/styled'
import { breakpoints } from '../../utils/variables'
import IconExtension from '../../resources/icon-extension.svg'
import IconCloudScreen from '../../resources/icon-cloud-screen.svg'
import IconOpenSource from '../../resources/icon-open-source.svg'
import { Link } from 'gatsby'
import Feature from './Feature'

const StyledFeatures = styled.div`
    .features {
        padding: 12rem 0;
    }

    .feature__container {
        display: flex;

        @media(max-width: ${breakpoints.md}) {
            flex-direction: column;
        }
    }
`

const features = [
    {
        img: <img src={IconCloudScreen} alt="Cloud Screen" />,
        title: "云端 & 桌面端",
        paragraphs: ['不确定自己是否需要开发web端或是桌面端或是二者兼备?', '通过 Theia，你只需要开发一次，就可以让IDE跑在浏览器或桌面应用程序上。']
    },
    {
        img: <img src={IconOpenSource} alt="Vendor Neutral Open Source" />,
        title: "Vendor Neutral",
        paragraphs: ['Theia项目由非营利性公司Eclipse Foundation托管，由多元化社区开发。', <>
            与其他“开源项目”项目不同，在开源项目基金会托管的项目是受到保护的，不会因单一采用者的决定而损害多元化社区的利益。<a href="https://www.eclipse.org/projects/dev_process/">了解更多</a>。
        </>]
    },
    {
        img: <img src={IconExtension} alt="Icon Extension" />,
        title: "可扩展的",
        paragraphs: ['Theia以模块化方式设计，允许扩展者和采用者自定义和扩展其各个方面。', 
        <>
            编写类IDE的产品就像在package.json文件中列出所有需要的扩展一样容易。通过实现<Link to='/docs/authoring_extensions'>自己的扩展</Link>来添加新功能也很容易，并且可以提供您所需的所有灵活性。
        </>]
    }
]

const Features = () => (
    <StyledFeatures>
        <section className="features" id="features">
            <div className="row feature__container">
                {features.map(
                    (feature, i) => <Feature key={`${i}+${feature.title}`} {...feature} />
                )}
            </div>
        </section>
    </StyledFeatures>
)

export default Features