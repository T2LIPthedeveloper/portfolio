"use client";
import React from "react";

function EducationItem(props) {
  const handleClick = () => {
    window.open(props.href, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleClick}
      className="group flex flex-row mb-4 p-5 transition-all hover:bg-surface-300 hover:bg-opacity-30 rounded"
    >
      <div className="mr-2 text-surface-600 basis-1/4 hidden md:flex">
        {props.startDate} {checkEndDate(props)}
      </div>
      <div className="md:basis-3/4">
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium transition-all"
        >
          {props.subject} ({props.degree})
        </a>
        <div className="text-surface-600 md:mb-4">{props.university}</div>
        <div className="text-surface-600 mb-4 md:hidden">{props.startDate} {checkEndDate(props)}</div>
        <div className="text-surface-600">{props.description}</div>
      </div>
    </div>
  );
}

function checkEndDate(props) {
  if (!props.endDate) {
    return "";
  } else {
    return "- " + props.endDate;
  }
}

export default EducationItem;
