import EditorBackground from './EditorBackground.tsx';
import EditorHeader from './EditorHeader';
import EditorFooter from './EditorFooter';
import EditorRoomsPanel from './EditorRoomsPanel';
import EditorModeToggle from './EditorModeToggle.tsx';

export default function EditorRoute() {
    return (
        <>
            <EditorHeader />
            <EditorBackground />
            <EditorFooter />
            <EditorRoomsPanel />
            <EditorModeToggle />
        </>
    );
}
