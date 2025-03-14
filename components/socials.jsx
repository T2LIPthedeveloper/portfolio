import React from "react";
import Image from 'next/image';

const Socials = (props) => {
    return (
        <div className='flex flex-1 flex-row items-center'>
            <a href={`mailto:${props.data.email}`} className='mr-4 transition-all border border-surface-300 hover:bg-primary-300 hover:bg-opacity-30 text-on-background py-2 px-4 rounded flex flex-1 justify-center items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span className='pl-2'>Get in touch</span>
            </a>
            <div className='flex flex-row'>
                <a href={props.data.github} target="_blank" rel="noopener noreferrer" className="mr-1 flex flex-row content-center justify-center">
                    <Image src="/logos/github-mark-white.png" alt="GitHub Logo" width={30} height={30} className='object-contain object-top mr-2' />
                </a>
                <a href={props.data.linkedin} target="_blank" rel="noopener noreferrer" className="mr-1 flex flex-row content-center justify-center">
                    <Image src="/logos/linkedin-mark-white.png" alt="LinkedIn Logo" width={30} height={30} className='object-contain object-top mr-2' />
                </a>
                <a href={props.data.medium} target="_blank" rel="noopener noreferrer" className="flex flex-row content-center justify-center">
                    <Image src="/logos/medium-mark.png" alt="Medium Logo" width={30} height={30} className='object-contain object-top' />
                </a>
            </div>
            
        </div>
    )
}

export default Socials