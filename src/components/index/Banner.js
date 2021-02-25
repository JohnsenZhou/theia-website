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
import TheiaLogoEdited from '../../resources/theia-logo-edited.svg'


const StyledBanner = styled.div`
    .banner {
        margin-top: 5rem;
        display: flex;

        @media(max-width: ${breakpoints.md}) {
            flex-direction: column;
            margin-top: 5rem;
        }

        p {
            margin-bottom: 2rem;
        }

        li {
            margin-left: 2rem;
        }

        strong {
            font-weight: 500;
        }

        img {
            display: block;
            height: 26rem;
            transform: translateX(-18rem) translateY(4rem);
        }

        div {
            width: 50%;
            max-width: 45rem;
            margin: 0 auto;

            @media(max-width: ${breakpoints.md}) {
                width: 100%;
                img {
                    margin: 0 auto 5rem;
                    height: 18rem;
                    transform: none;
                }
            }
        }

        h3 {
            margin-bottom: 2rem;
            @media(max-width: ${breakpoints.md}) {
                width: 100%;
                max-width: 60rem;
                margin: 0 auto;
                margin-bottom: 2rem;
                text-align: center;
            }
        }
    }
`

const Banner = () => (
    <StyledBanner>
        <section className="row banner">
            <div>
                <img src={TheiaLogoEdited} alt="Theia Logo" />
            </div>
            <div>
                <h3 className="heading-tertiary">Theia 与 VS Code</h3>
                <p>我们认为<strong>VS Code是出色的产品</strong>。因此，Theia采纳了许多设计决策，甚至直接支持VS Code扩展。</p>
                <div style={{ width: '100%', margin: '2rem 0', maxWidth: 'auto' }}>最重要的区别是：
                                <ul>
                        <li><strong>Theia的体系结构更具模块化</strong>，并允许更多的自定义方式。</li>
                        <li>Theia 是<strong>专为在桌面端和云端上运行而设计的</strong>。</li>
                        <li>Theia由<strong>与商业无关的开源基金会</strong>开发。</li>
                    </ul>
                </div>
            </div>
        </section>
    </StyledBanner>
)

export default Banner