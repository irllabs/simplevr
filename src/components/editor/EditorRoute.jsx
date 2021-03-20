import React from 'react';
import EditorBackground from './EditorBackground.tsx';
import EditorHeader from './EditorHeader';
import EditorFooter from './EditorFooter';
import EditorRoomsPanel from './EditorRoomsPanel';

export default function EditorRoute() {
    return (
        <>
            <EditorHeader />
            <EditorBackground />
            <EditorFooter />
            <EditorRoomsPanel />
        </>
    );
}
