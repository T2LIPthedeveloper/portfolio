"use client";
import React from "react";
import Image from "next/image";

function ExperienceItem(props) {
    const handleClick = () => {
        window.open(props.href, "_blank", "noopener,noreferrer");
    };

    return (
        <div onClick={handleClick} className="group flex flex-row mb-4 p-5 transition-all hover:bg-surface-300 hover:bg-opacity-30 rounded cursor-pointer">
            <div className="basis-1/4 mr-2 hidden md:flex">
                <Image src={props.logo} alt="Company Logo" width={100} height={70} className='object-contain object-top pt-2' />
            </div>
            <div className='md:basis-3/4'>
                <a href={props.href} target="_blank" rel="noopener noreferrer" className='font-medium transition-all'>{props.title} | {props.company} </a>
                <div className='mb-2 text-surface-600'>{props.startDate} - {props.endDate}</div>
                <div className='text-surface-600 mb-4'>{props.description}</div>
                <div className='flex flex-row'>
                    {props.skills ? props.skills.map(function(object, index){
                        return <div key={object} className='bg-surface-400 py-1 px-3 rounded-full text-xs mr-2'>{object}</div>
                    }) : ""}
                </div>
            </div>
        </div>
    )
}

export default ExperienceItem