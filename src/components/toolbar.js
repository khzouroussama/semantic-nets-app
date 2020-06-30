import React from 'react';
import tw from 'twin.macro'


const Toolbar = tw.nav`flex w-full items-center bg-gray-800 p-3 flex-wrap px-4 shadow-lg z-10` 


const ToolBar = () => {
    return (
        <Toolbar >
            <span tw=" inline-flex items-center">
                <span tw="text-lg text-white font-bold uppercase tracking-wide">
                    Semantic networks
                </span>
            </span>
        </Toolbar>
    )
}
export default ToolBar ;