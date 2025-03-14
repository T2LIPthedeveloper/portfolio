import React from "react";

function NavItem(props) {
    return (
        <a href={props.href} className='flex flex-row items-center px-4 group'>
            <div className={props.active ? 'transition-all text-on-background group-hover:text-primary-500' : 'transition-all text-surface-600 group-hover:text-primary-500'}>{props.name}</div>
        </a>
    )
}

export default NavItem