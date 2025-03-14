import React from 'react';
import Chatbot from '@/components/chatbot';
import Navigation from '@/components/navigation';
import Credits from '@/components/credits';
import {promises as fs} from 'fs';

export default async function Chat() {
    const file = await fs.readFile(process.cwd() + '/public/translations/en.json', 'utf-8');
    const data = JSON.parse(file);

    return (
        <main className="flex h-screen max-h-screen w-full flex-col items-center px-6 lg:px-24 bg-gradient-to-br from-surface-100 via-surface-200 to-surface-100 no-scrollbar">
            <div className='bg-[linear-gradient(to_right,#28282850_1px,transparent_1px),linear-gradient(to_bottom,#28282850_1px,transparent_1px)] bg-[size:24px_24px] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,transparent_60%,#000_100%)] w-full h-full fixed top-0 left-0'>
            </div>
            <div className="z-10 w-full max-w-5xl font-mono text-sm flex flex-col h-full">
                <Navigation />
                <div className="flex-1 flex flex-col">
                    <Chatbot />
                    <Credits data={data.general}></Credits>
                </div>
            </div>
        </main>
    );
}