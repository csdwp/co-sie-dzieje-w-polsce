import { useState, useEffect, useRef } from 'react';

interface InlineEditableContentProps {
  content: string;
  field: 'content' | 'simple_title' | 'impact_section';
  actId: string | number;
  isAdmin: boolean;
  onSave?: (newContent: string) => void;
}

const InlineEditableContent: React.FC<InlineEditableContentProps> = ({
  content,
  field,
  actId,
  isAdmin,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  useEffect(() => {
    setTempContent(content);
  }, [content]);

  useEffect(() => {
    if (contentRef.current && !isEditing) {
      const height = contentRef.current.offsetHeight;
      setContentHeight(height);
    }
  }, [content, isEditing]);

  const handleSave = async () => {
    if (tempContent.trim().length < 10) {
      alert('Treść jest za krótka (minimum 10 znaków)');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/update-act', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actId,
          [field === 'simple_title'
            ? 'simpleTitle'
            : field === 'impact_section'
              ? 'impactSection'
              : field]: tempContent,
        }),
      });

      if (response.ok) {
        alert('Zapisano. Rebuild w toku (~2-5 min). Odświeżanie strony...');
        onSave?.(tempContent);
        setIsEditing(false);
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(
          `Błąd: ${errorData.message || 'Wystąpił błąd podczas zapisywania'}`
        );
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Wystąpił błąd podczas zapisywania');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempContent(content);
    setIsEditing(false);
  };

  if (!isAdmin)
    return (
      <div
        className="text-base tracking-wide text-neutral-900 font-light dark:text-neutral-100 md:max-w-4/5 text-left flex flex-col gap-2"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );

  if (!isEditing)
    return (
      <div
        className="group text-base tracking-wide text-neutral-900 font-light dark:text-neutral-100 md:max-w-4/5 text-left cursor-pointer flex flex-col gap-2 relative hover:border-[1px] border-white/50 rounded-3xl"
        onClick={() => setIsEditing(true)}
        title="Kliknij aby edytować"
      >
        <span
          className="group-hover:scale-95 transition-transform origin-center"
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <span
          role="img"
          aria-label="Edytuj"
          className="top-0 -right-3 absolute group-hover:opacity-100 opacity-0 transition-opacity duration-200 bg-white p-1.5 aspect-square flex items-center justify-center rounded-full"
        >
          ✏️
        </span>
      </div>
    );

  return (
    <div className="space-y-2 w-full md:max-w-4/5 ">
      <textarea
        value={tempContent}
        onChange={e => setTempContent(e.target.value)}
        style={{ height: `${contentHeight}px` }}
        className="w-full min-h-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base tracking-wide text-neutral-900 font-light dark:text-neutral-100 text-left"
        placeholder="Wprowadź treść..."
        disabled={isSaving}
      />
      <div className="flex gap-2 justify-end">
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anuluj
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || tempContent.trim().length < 10}
          className="px-4 py-2 bg-red-500/70 text-white rounded hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Zapisywanie...' : 'Zapisz'}
        </button>
      </div>
    </div>
  );
};

export default InlineEditableContent;
