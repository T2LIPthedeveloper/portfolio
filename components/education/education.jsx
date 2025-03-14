import React from "react";
import EducationItem from "./education-item";

const Education = (props) => {
    return (
        <div data-section id='education' className='pt-20'>
            <h2 className='mb-8 text-xl font-medium'>Education</h2>
            {props.data.map(function(object, index){
                return <EducationItem
                    key={`${object.subject}+${object.startDate}`}  
                    subject={object.subject}
                    degree={object.degree}
                    university={object.university}
                    href={object.href}
                    startDate={object.startDate} 
                    endDate={object.endDate ? object.endDate : ''} 
                    description={object.description}
                />
            })}
        </div>
    )
}

export default Education