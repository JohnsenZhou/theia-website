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
import CompletionVideo from '../../resources/completion.mp4'
import TermianlVideo from '../../resources/terminal.mp4'
import LayoutVideo from '../../resources/layout.mp4'
import Promo from './Promo'

const StyledPromos = styled.div`
    .promos {
        margin: 15rem 0;
    }
`

const promos = [
    {
        title: "支持 JavaScript, Java, Python 等语言",
        para: <p>
            基于 <a href="https://microsoft.github.io/language-server-protocol/" target="_blank" rel="noopener noreferrer">LSP</a>协议,
            Theia 得益于<strong>60多种可用语言服务器</strong>的不断发展的生态系统，为所有主要编程语言提供智能编辑支持。
        </p>,
        videoSrc: CompletionVideo
    },
    {
        title: "终端集成",
        para: <p>Theia 集成了功能齐全的终端，可在重新加载浏览器时重新连接，以保留完整的历史记录。</p>,
        videoSrc: TermianlVideo
    },
    {
        title: "弹性布局",
        para: <p>Theia整体由轻巧的模块化小部件组成，这些小部件为可拖动的布局提供了坚实的基础。</p>,
        videoSrc: LayoutVideo
    }
]

const Promos = () => (
    <StyledPromos>
        <section className="promos">
            <div className="row">
                { promos.map((promo, i) => <Promo key={i} {...promo} />) }
            </div>
        </section>
    </StyledPromos>
)

export default Promos