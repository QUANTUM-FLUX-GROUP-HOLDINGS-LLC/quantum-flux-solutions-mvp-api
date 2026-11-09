import { useEffect, useState } from 'react';
import { FileText, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../shared/api';

type Template = {
  id: string;
  bureau: string;
  title: string;
  content: string;
};

export const LetterLibraryModule = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const selectedTemplate = templates.find((t) => t.id === selectedId) ?? null;
  const isDirty = selectedTemplate ? dirtyIds.has(selectedTemplate.id) : false;

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<Template[]>('/letters');
        setTemplates(data);
        setSelectedId(data[0]?.id ?? null);
      } catch {
        toast.error('Failed to load letter templates.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedId) return;
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, content: e.target.value } : t)),
    );
    setDirtyIds((prev) => new Set(prev).add(selectedId));
  };

  const handleSave = async () => {
    if (!selectedTemplate || !isDirty) return;
    setSaving(true);
    try {
      const updated = await apiFetch<Template>(`/letters/${selectedTemplate.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: selectedTemplate.content }),
      });
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setDirtyIds((prev) => {
        const next = new Set(prev);
        next.delete(updated.id);
        return next;
      });
      toast.success('Template saved.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save template.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Templates sidebar */}
      <div className="w-72 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Templates</h2>
          <p className="text-xs text-gray-500 mt-1">Manage dispute letters</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedId(t.id)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                selectedId === t.id
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 opacity-70 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-sm">{t.bureau}</p>
                <p className="text-xs opacity-70 truncate w-40">{t.title}</p>
              </div>
              {dirtyIds.has(t.id) && <span className="w-2 h-2 bg-amber-500 rounded-full ml-auto shrink-0" />}
            </button>
          ))}
          {!loading && templates.length === 0 && (
            <p className="px-4 py-3 text-xs text-gray-500">
              No templates found. Run the letters seed script on the backend.
            </p>
          )}
        </div>
      </div>

      {/* Text editor */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-gray-900">{selectedTemplate?.title ?? 'Templates'}</h3>
            <p className="text-xs text-gray-500">
              {loading
                ? 'Loading...'
                : selectedTemplate
                  ? isDirty
                    ? 'Unsaved changes'
                    : 'Edit the template body below'
                  : 'Select a template'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedTemplate || !isDirty}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
        <div className="flex-1 p-6 bg-gray-50">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <textarea
              value={selectedTemplate?.content ?? ''}
              onChange={handleContentChange}
              disabled={!selectedTemplate}
              aria-label={`Template content for ${selectedTemplate?.bureau ?? 'selected template'}`}
              className="w-full h-full p-6 border border-gray-300 rounded-lg shadow-inner focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm leading-relaxed resize-none bg-white disabled:bg-gray-100"
              placeholder="Write your letter template here..."
            />
          )}
        </div>
      </div>
    </div>
  );
};
