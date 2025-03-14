"use client";

import React from "react";
import Navigation from "./navigation";
import Socials from "./socials";
import Chatbot from "./chatbot";

const MainComponent = (props) => {
    return (
        <div data-section id='about' className="flex flex-col mb-16 group pt-16">
            <div className="hero-section flex flex-col justify-center items-center text-center py-20 space-y-4">
                <h1 className="text-5xl subpixel-antialiased font-semibold tracking-wide">
                    Hi, I'm {props.data.name}.
                </h1>
                <h2 className="text-surface-600 pt-2 text-base subpixel-antialiased font-normal tracking-wider">
                    {props.data.headline}
                </h2>
                <Socials data={props.data.socials} />
            </div>
            <div className='text-surface-600'>
                {props.data.about.map(function(paragraph, index){
                    return <div key={index} className='mb-6'>{paragraph}</div>
                })}
            </div>
        </div>
    );
};

export default MainComponent;