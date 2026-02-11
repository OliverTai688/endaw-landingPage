"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Image as ImageIcon,
    Type,
    Underline as UnderlineIcon,
    Heading1,
    Heading2
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt('URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-white/10 bg-zinc-900/50">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('bold') ? 'text-gold bg-white/5' : 'text-gray-400'}`}
                title="Bold"
            >
                <Bold size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('italic') ? 'text-gold bg-white/5' : 'text-gray-400'}`}
                title="Italic"
            >
                <Italic size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('underline') ? 'text-gold bg-white/5' : 'text-gray-400'}`}
                title="Underline"
            >
                <UnderlineIcon size={16} />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 1 }) ? 'text-gold bg-white/5' : 'text-gray-400'}`}
                title="Heading 1"
            >
                <Heading1 size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 2 }) ? 'text-gold bg-white/5' : 'text-gray-400'}`}
                title="Heading 2"
            >
                <Heading2 size={16} />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('bulletList') ? 'text-gold bg-white/5' : 'text-gray-400'}`}
                title="Bullet List"
            >
                <List size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('orderedList') ? 'text-gold bg-white/5' : 'text-gray-400'}`}
                title="Ordered List"
            >
                <ListOrdered size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('blockquote') ? 'text-gold bg-white/5' : 'text-gray-400'}`}
                title="Blockquote"
            >
                <Quote size={16} />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1 self-center" />
            <button
                onClick={addImage}
                className="p-1.5 rounded hover:bg-white/10 text-gray-400"
                title="Insert Image"
            >
                <ImageIcon size={16} />
            </button>
            <div className="flex-1" />
            <button
                onClick={() => editor.chain().focus().undo().run()}
                className="p-1.5 rounded hover:bg-white/10 text-gray-400"
                title="Undo"
            >
                <Undo size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                className="p-1.5 rounded hover:bg-white/10 text-gray-400"
                title="Redo"
            >
                <Redo size={16} />
            </button>
        </div>
    );
};

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-gold underline cursor-pointer',
                },
            }),
            Image,
            Underline,
        ],
        content: content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[150px] p-4 text-white',
            },
        },
    });

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-black/50 focus-within:border-gold/50 transition-colors">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
