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

const M = (title, path, subMenu, indented = false) => ({
    title,
    path: '/docs/' + (path ? path + '/' : ''),
    subMenu,
    indented
})

export const MENU = [
    {
        title: '架构'
    },
    M(
        '概述',
        'architecture'
    ),
    M(
        '扩展',
        'extensions'
    ),
    M(
        'Services and Contributions',
        'services_and_contributions'
    ),
    {
        title: '使用'
    },
    M(
        '构建你的IDE',
        'composing_applications'
    ),
    M(
        '开发扩展',
        'authoring_extensions'
    ),
    M(
        '开发插件',
        'authoring_plugins'
    ),
    M(
        '新增语言支持',
        'language_support'
    ),
    M(
        'TextMate Coloring',
        'textmate',
        null,
        true
    ),
    {
        title: '核心 API'
    },
    M(
        'Commands and Keybindings',
        'commands_keybindings'
    ),
    M(
        '首选项',
        'preferences'
    ),
    M(
        '事件',
        'events'
    ),
    M(
        '通过JSON-RPC进行通信',
        'json_rpc'
    )
]

export function getMenuContext(slug, menu = MENU, context = {}) {
    const indexOfCurrent = menu.findIndex(({path}) => {
        if (path) {
            return path.includes(slug)
        }
        return false
    })
    const prev =  menu[indexOfCurrent - 1] && menu[indexOfCurrent - 1].path ?
        menu[indexOfCurrent - 1].path : menu[indexOfCurrent - 2] && 
        menu[indexOfCurrent - 2].path && menu[indexOfCurrent - 2].path

    const prevTitle = menu[indexOfCurrent - 1] && menu[indexOfCurrent - 1].path ?
        menu[indexOfCurrent - 1].title :
        menu[indexOfCurrent - 2] && menu[indexOfCurrent - 2].path && 
        menu[indexOfCurrent - 2].title
    
    const next = menu[indexOfCurrent + 1] && menu[indexOfCurrent + 1].path ?
        menu[indexOfCurrent + 1].path : menu[indexOfCurrent + 2] && 
        menu[indexOfCurrent + 2].path && menu[indexOfCurrent + 2].path

    const nextTitle = menu[indexOfCurrent + 1] && menu[indexOfCurrent + 1].path ?
        menu[indexOfCurrent + 1].title :
        menu[indexOfCurrent + 2] && menu[indexOfCurrent + 2].path && 
        menu[indexOfCurrent + 2].title

    return { 
        prev: prev, 
        prevTitle, 
        next: next, 
        nextTitle 
    }
}