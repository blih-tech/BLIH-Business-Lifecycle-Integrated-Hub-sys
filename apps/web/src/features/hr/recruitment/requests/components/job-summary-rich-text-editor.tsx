'use client';

import { Placeholder } from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';
import { Bold, Italic, List, ListOrdered, Redo2, Undo2 } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

type ToolbarButtonProps = {
  disabled?: boolean;
  icon: typeof Bold;
  isActive?: boolean;
  label: string;
  onClick: () => void;
};

type JobSummaryRichTextEditorProps = {
  disabled?: boolean;
  onBlur?: () => void;
  onChange: (value: string) => void;
  value: string;
};

function ToolbarButton({
  disabled,
  icon: Icon,
  isActive,
  label,
  onClick,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        'h-8 w-8 rounded-lg border border-transparent text-muted-foreground transition-colors',
        isActive && 'border-border bg-muted text-foreground',
        !disabled &&
          'hover:border-border hover:bg-muted/80 hover:text-foreground',
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
    </Button>
  );
}

export function JobSummaryRichTextEditor({
  disabled,
  onBlur,
  onChange,
  value,
}: JobSummaryRichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder:
          'Describe the role, the team, and the main impact this person will make.',
        emptyEditorClass:
          'before:pointer-events-none before:absolute before:top-3.5 before:left-3.5 before:text-sm before:text-muted-foreground before:content-[attr(data-placeholder)]',
      }),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          'tiptap min-h-[140px] px-3.5 py-3.5 text-sm leading-6 text-foreground focus:outline-none',
      },
    },
    onBlur: () => {
      onBlur?.();
    },
    onUpdate: ({ editor: nextEditor }) => {
      onChange(nextEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  return (
    <div className="overflow-hidden rounded-[12px] border border-border bg-background shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.92))] px-2.5 py-2">
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarButton
            label="Bold"
            icon={Bold}
            disabled={!editor || disabled}
            isActive={editor?.isActive('bold')}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label="Italic"
            icon={Italic}
            disabled={!editor || disabled}
            isActive={editor?.isActive('italic')}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            label="Bullet list"
            icon={List}
            disabled={!editor || disabled}
            isActive={editor?.isActive('bulletList')}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            label="Numbered list"
            icon={ListOrdered}
            disabled={!editor || disabled}
            isActive={editor?.isActive('orderedList')}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton
            label="Undo"
            icon={Undo2}
            disabled={!editor?.can().chain().focus().undo().run() || disabled}
            onClick={() => editor?.chain().focus().undo().run()}
          />
          <ToolbarButton
            label="Redo"
            icon={Redo2}
            disabled={!editor?.can().chain().focus().redo().run() || disabled}
            onClick={() => editor?.chain().focus().redo().run()}
          />
        </div>
      </div>

      <EditorContent
        editor={editor}
        className={cn(
          'relative bg-background',
          disabled && 'cursor-not-allowed opacity-70',
          '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5',
          '[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
          '[&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5',
        )}
      />
    </div>
  );
}
