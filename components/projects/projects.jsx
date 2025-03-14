"use client";
import React from "react";
import ProjectItem from "./project-item";

const Projects = (props) => {
    const [visibleProjects, setVisibleProjects] = React.useState(6);

    const showMoreProjects = () => {
        setVisibleProjects((prevVisibleProjects) => prevVisibleProjects + 6);
    };

    return (
        <div data-section id='projects' className='pt-20 flex flex-col'>
            <h2 className='mb-8 text-xl font-medium'>Projects</h2>
            <div className='grid grid-cols-2 lg:grid-cols-3 gap-2'>
                {props.data.slice(0, visibleProjects).map((object, index) => (
                    <ProjectItem
                        key={object.name}
                        name={object.name}
                        stars={object.stars}
                        lib={object.framework}
                        description={object.description}
                        href={object.href}
                    />
                ))}
            </div>
            {visibleProjects < props.data.length ? (
                <div className='flex justify-center mt-8'>
                    <button
                        onClick={showMoreProjects}
                        className='transition-all border border-surface-300 hover:bg-primary-300 hover:bg-opacity-30 text-on-background py-2 px-8 rounded flex flex-row justify-center items-center'
                    >
                        <span className='pl-2'>Show more</span>
                    </button>
                </div>
            ) : (
                <div className='flex justify-center mt-8'>
                    <a
                        href={`https://github.com/T2LIPthedeveloper`}
                        className='transition-all border border-surface-300 hover:bg-primary-300 hover:bg-opacity-30 text-on-background py-2 px-8 rounded flex flex-row justify-center items-center'
                    >
                        <span className='pl-2'>View More on GitHub</span>
                    </a>
                </div>
            )}
        </div>
    );
}

export default Projects