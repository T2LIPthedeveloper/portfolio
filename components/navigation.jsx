'use client'

import React, { useState, useEffect, useRef } from "react";

function NavItem(props) {
    return (
        <a href={props.href} className='flex flex-row items-center px-4 group'>
            <div className={props.active ? 'transition-all text-on-background group-hover:text-primary-500' : 'transition-all text-surface-600 group-hover:text-primary-500'}>{props.name}</div>
        </a>
    )
}

const Navigation = () => {
    const [activeSection, setActiveSection] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            {/* Mobile hamburger menu */}
            <div className="fixed top-4 left-4 md:hidden z-20">
                <button 
                    onClick={toggleMenu} 
                    className="p-2 bg-surface-100 bg-opacity-50 rounded-lg shadow-lg border-2 border-surface-200 backdrop-blur-md"
                >
                    <div className="w-6 h-0.5 bg-surface-600 mb-1.5"></div>
                    <div className="w-6 h-0.5 bg-surface-600 mb-1.5"></div>
                    <div className="w-6 h-0.5 bg-surface-600"></div>
                </button>
            </div>

            {/* Mobile menu */}
            <div className={`fixed top-0 left-0 w-full h-screen bg-surface-100 bg-opacity-95 backdrop-blur-md z-10 transform transition-transform duration-300 md:hidden ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="flex flex-col items-center justify-center h-full space-y-6 text-lg font-medium" onClick={toggleMenu}>
                    <NavItem active={activeSection === 'about'} href='/#about' name="ABOUT" />
                    <NavItem active={activeSection === 'experiences'} href='/#experiences' name="EXPERIENCES" />
                    <NavItem active={activeSection === 'education'} href='/#education' name="EDUCATION" />
                    <NavItem active={activeSection === 'projects'} href='/#projects' name="PROJECTS" />
                    <NavItem active={activeSection === 'chat'} href='/chat' name="CHAT" />
                </div>
            </div>

            {/* Desktop navigation */}
            <div id='navigation' className='fixed top-2 left-1/2 transform -translate-x-1/2 w-auto hidden md:flex py-4 font-medium tracking-widest bg-surface-100 bg-opacity-50 shadow-lg rounded-lg z-10 backdrop-blur-md border-2 border-surface-200 text-sm'>
                <NavItem active={activeSection === 'about'} href='/#about' num='01' name="ABOUT" className="flex-1 px-4 py-2 hover:bg-gray-100 rounded-md" />
                <NavItem active={activeSection === 'experiences'} href='/#experiences' num='02' name="EXPERIENCES" className="flex-1 px-4 py-2 hover:bg-gray-100 rounded-md" />
                <NavItem active={activeSection === 'education'} href='/#education' num='03' name="EDUCATION" className="flex-1 px-4 py-2 hover:bg-gray-100 rounded-md" />
                <NavItem active={activeSection === 'projects'} href='/#projects' num='04' name="PROJECTS" className="flex-1 px-4 py-2 hover:bg-gray-100 rounded-md" />
                <NavItem active={activeSection === 'chat'} href='/chat' num='05' name="CHAT" className="flex-1 px-4 py-2 hover:bg-gray-100 rounded-md" />
            </div>
        </>
    );
}

export default Navigation;
