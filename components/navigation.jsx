'use client'

import React, { useState, useEffect, useRef } from "react";
import NavItem from "./nav-item";

const Navigation = () => {
    const [activeSection, setActiveSection] = useState(null);
    const observer = useRef(null);

    useEffect(() => {
        observer.current = new IntersectionObserver((entries) => {
            const visibleSection = entries.find((entry) => entry.isIntersecting)?.target;
            if (visibleSection) {
                setActiveSection(visibleSection.id);
            }
        }, { threshold: 0.5 });

        const sections = document.querySelectorAll('[data-section]');

        sections.forEach((section) => {
            observer.current.observe(section);
        });

        return () => {
            sections.forEach((section) => {
                observer.current.unobserve(section);
            });
        };
    }, []);

    return (
        <div id='navigation' className='fixed top-2 left-1/2 transform -translate-x-1/2 w-auto flex py-2 md:py-4 font-medium md:tracking-widest bg-surface-100 bg-opacity-50 shadow-lg rounded-lg z-10 backdrop-blur-md border-2 border-surface-200 text-xs md:text-sm'>
            <NavItem active={activeSection === 'about'} href='/#about' num='01' name="ABOUT" className="flex-1 px-4 py-2 hover:bg-gray-100 rounded-md"></NavItem>
            <NavItem active={activeSection === 'experiences'} href='/#experiences' num='02' name="EXPERIENCES" className="flex-1 px-4 py-2 hover:bg-gray-100 rounded-md"></NavItem>
            <NavItem active={activeSection === 'education'} href='/#education' num='03' name="EDUCATION" className="flex-1 px-4 py-2 hover:bg-gray-100 rounded-md"></NavItem>
            <NavItem active={activeSection === 'projects'} href='/#projects' num='04' name="PROJECTS" className="flex-1 px-4 py-2 hover:bg-gray-100 rounded-md"></NavItem>
            <NavItem active={activeSection === 'chat'} href='/chat' num='05' name="CHAT" className="flex-1 px-4 py-2 hover:bg-gray-100 rounded-md"></NavItem>
        </div>
    );
}

export default Navigation;
