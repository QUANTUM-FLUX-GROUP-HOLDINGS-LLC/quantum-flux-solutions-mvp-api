import { useState } from 'react';
import { FileText, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Template = {
  id: string;
  bureau: string;
  title: string;
  content: string;
};

const INITIAL_TEMPLATES: Template[] = [
  {
    id: 'equifax',
    bureau: 'Equifax',
    title: 'Equifax Dispute Letter',
    content: `To Whom It May Concern,\n\nI am writing to dispute the following information in my file. The items I dispute are also encircled on the attached copy of the report I received.\n\nThis item is inaccurate. I am requesting that you investigate this matter and remove the inaccurate information.\n\nSincerely,\n[CLIENT NAME]`,
  },
  {
    id: 'experian',
    bureau: 'Experian',
    title: 'Experian Dispute Letter',
    content: `To Whom It May Concern,\n\nI am writing to dispute the following information in my file.\n\nThis item is inaccurate. I am requesting that you investigate this matter and remove the inaccurate information.\n\nSincerely,\n[CLIENT NAME]`,
  },
  {
    id: 'transunion',
    bureau: 'TransUnion',
    title: 'TransUnion Dispute Letter',
    content: `To Whom It May Concern,\n\nI am writing to dispute the following information in my file.\n\nThis item is inaccurate. I am requesting that you investigate this matter and remove the inaccurate information.\n\nSincerely,\n[CLIENT NAME]`,
  },
];

export const LetterLibraryModule = () => {
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_TEMPLATES[0].id);
  const [saving, setSaving] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedId)!;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, content: e.target.value } : t))
    );
  };

  const handleSave = () => {
    setSaving(true);
    // Simulamos guardado en backend (aquí conectarías con un endpoint POST /letters)
    setTimeout(() => {
      toast.success('Template saved successfully (local)');
      setSaving(false);
    }, 800);
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Sidebar de Plantillas */}
      <div className="w-72 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Templates</h2>
          <p className="text-xs text-gray-500 mt-1">Manage dispute letters</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                selectedId === t.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 opacity-70" />
              <div>
                <p className="font-semibold text-sm">{t.bureau}</p>
                <p className="text-xs opacity-70 truncate w-40">{t.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor de Texto */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <div>
            <h3 className="font-bold text-gray-900">{selectedTemplate.title}</h3>
            <p className="text-xs text-gray-500">Edit the template body below</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
        <div className="flex-1 p-6 bg-gray-50">
          <textarea
            value={selectedTemplate.content}
            onChange={handleContentChange}
            className="w-full h-full p-6 border border-gray-300 rounded-lg shadow-inner focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm leading-relaxed resize-none"
            placeholder="Write your letter template here..."
          />
        </div>
      </div>
    </div>
  );
};
