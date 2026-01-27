import { useState, useEffect, useRef } from "react";
import { useAdmin } from "../../context/AdminContext";
import { useNotification } from "../../context/NotificationContext";
import { API_ENDPOINTS } from "../../config/api";
import axios from "axios";

interface Rule {
  _id: string;
  title: string;
  description: string;
  sport: string;
  category: string;
  order: number;
}

interface AddRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRuleAdded: () => void;
  editRule?: Rule | null;
}

const SPORTS = [
  "General",
  "Football",
  "Volleyball",
  "Basketball",
  "Kabaddi",
  "Badminton",
  "Chess",
  "Kho Kho",
  "Table Tennis",
  "Tug of War",
  "Cricket",
  "Athletics",
];

const CATEGORIES = [
  "General Rules",
  "Game Rules",
  "Eligibility",
  "Conduct",
  "Scoring",
  "Equipment",
  "Other",
];

// Rich text editor toolbar button component
const ToolbarButton = ({ 
  onClick, 
  icon, 
  title, 
  active = false 
}: { 
  onClick: () => void; 
  icon: React.ReactNode; 
  title: string;
  active?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-colors ${
      active 
        ? "bg-blue-100 text-blue-700" 
        : "hover:bg-slate-100 text-slate-600"
    }`}
  >
    {icon}
  </button>
);

export default function AddRuleModal({ 
  isOpen, 
  onClose, 
  onRuleAdded,
  editRule 
}: AddRuleModalProps) {
  const { token } = useAdmin();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sport: "General",
    category: "General Rules",
    order: "0",
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (editRule) {
      setFormData({
        title: editRule.title,
        description: editRule.description,
        sport: editRule.sport,
        category: editRule.category,
        order: editRule.order.toString(),
      });
    } else {
      setFormData({
        title: "",
        description: "",
        sport: "General",
        category: "General Rules",
        order: "0",
      });
    }
    setShowPreview(false);
  }, [editRule, isOpen]);

  // Text formatting helper functions
  const insertTextAtCursor = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.description.substring(start, end);
    const newText = 
      formData.description.substring(0, start) + 
      before + selectedText + after + 
      formData.description.substring(end);
    
    setFormData({ ...formData, description: newText });
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const wrapSelectedText = (wrapper: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.description.substring(start, end);
    
    // Check if already wrapped
    const beforeText = formData.description.substring(Math.max(0, start - wrapper.length), start);
    const afterText = formData.description.substring(end, Math.min(formData.description.length, end + wrapper.length));
    
    if (beforeText === wrapper && afterText === wrapper) {
      // Remove wrapper
      const newText = 
        formData.description.substring(0, start - wrapper.length) + 
        selectedText + 
        formData.description.substring(end + wrapper.length);
      setFormData({ ...formData, description: newText });
    } else {
      // Add wrapper
      const newText = 
        formData.description.substring(0, start) + 
        wrapper + selectedText + wrapper + 
        formData.description.substring(end);
      setFormData({ ...formData, description: newText });
    }
    
    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  const addBulletPoint = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = formData.description;
    
    // Find the start of the current line
    let lineStart = start;
    while (lineStart > 0 && text[lineStart - 1] !== '\n') {
      lineStart--;
    }
    
    // Check if already a bullet point
    const linePrefix = text.substring(lineStart, lineStart + 2);
    if (linePrefix === '• ' || linePrefix === '- ') {
      return;
    }
    
    const newText = text.substring(0, lineStart) + '• ' + text.substring(lineStart);
    setFormData({ ...formData, description: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, start + 2);
    }, 0);
  };

  const addNumberedPoint = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = formData.description;
    
    // Find the start of current line and count previous numbered items
    let lineStart = start;
    while (lineStart > 0 && text[lineStart - 1] !== '\n') {
      lineStart--;
    }
    
    // Count existing numbered items
    const lines = text.substring(0, lineStart).split('\n');
    let lastNumber = 0;
    for (let i = lines.length - 1; i >= 0; i--) {
      const match = lines[i].match(/^(\d+)\./);
      if (match) {
        lastNumber = parseInt(match[1]);
        break;
      }
    }
    
    const newNumber = lastNumber + 1;
    const newText = text.substring(0, lineStart) + `${newNumber}. ` + text.substring(lineStart);
    setFormData({ ...formData, description: newText });
    
    setTimeout(() => {
      textarea.focus();
      const offset = `${newNumber}. `.length;
      textarea.setSelectionRange(start + offset, start + offset);
    }, 0);
  };

  // Preview renderer
  const renderPreview = (text: string) => {
    if (!text) return <p className="text-slate-400 italic">No content to preview</p>;
    
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: { type: 'bullet' | 'numbered'; items: string[] } | null = null;
    let listKey = 0;

    const processInline = (line: string, key: number) => {
      const parts: (string | JSX.Element)[] = [];
      let remaining = line;
      let partKey = 0;

      while (remaining.length > 0) {
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

        if (boldMatch && (!italicMatch || boldMatch.index! <= italicMatch.index!)) {
          const before = remaining.substring(0, boldMatch.index!);
          if (before) parts.push(before);
          parts.push(<strong key={`b-${key}-${partKey++}`} className="font-bold text-slate-900">{boldMatch[1]}</strong>);
          remaining = remaining.substring(boldMatch.index! + boldMatch[0].length);
        } else if (italicMatch) {
          const before = remaining.substring(0, italicMatch.index!);
          if (before) parts.push(before);
          parts.push(<em key={`i-${key}-${partKey++}`} className="italic">{italicMatch[1]}</em>);
          remaining = remaining.substring(italicMatch.index! + italicMatch[0].length);
        } else {
          parts.push(remaining);
          break;
        }
      }

      return <span key={key}>{parts}</span>;
    };

    const flushList = () => {
      if (currentList) {
        if (currentList.type === 'bullet') {
          elements.push(
            <ul key={`list-${listKey++}`} className="list-none space-y-1 my-2">
              {currentList.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                  <span>{processInline(item, i)}</span>
                </li>
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ol key={`list-${listKey++}`} className="list-none space-y-1 my-2">
              {currentList.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 mt-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span>{processInline(item, i)}</span>
                </li>
              ))}
            </ol>
          );
        }
        currentList = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const bulletMatch = trimmed.match(/^[-•]\s*(.+)$/);
      const numberedMatch = trimmed.match(/^\d+[.)]\s*(.+)$/);

      if (bulletMatch) {
        if (!currentList || currentList.type !== 'bullet') {
          flushList();
          currentList = { type: 'bullet', items: [] };
        }
        currentList.items.push(bulletMatch[1]);
      } else if (numberedMatch) {
        if (!currentList || currentList.type !== 'numbered') {
          flushList();
          currentList = { type: 'numbered', items: [] };
        }
        currentList.items.push(numberedMatch[1]);
      } else if (trimmed === '') {
        flushList();
        elements.push(<div key={`br-${index}`} className="h-1"></div>);
      } else {
        flushList();
        elements.push(
          <p key={index} className="mb-1">
            {processInline(trimmed, index)}
          </p>
        );
      }
    });

    flushList();
    return <div className="text-sm text-slate-700">{elements}</div>;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        sport: formData.sport,
        category: formData.category,
        order: parseInt(formData.order),
      };

      if (editRule) {
        await axios.put(API_ENDPOINTS.RULES_UPDATE(editRule._id), payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showNotification("Rule updated successfully", "success");
      } else {
        await axios.post(API_ENDPOINTS.RULES_CREATE, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showNotification("Rule added successfully", "success");
      }

      onRuleAdded();
      onClose();
      setFormData({
        title: "",
        description: "",
        sport: "General",
        category: "General Rules",
        order: "0",
      });
    } catch (error: any) {
      showNotification(error.response?.data?.error || "Failed to save rule", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {editRule ? "Edit Rule" : "Add New Rule"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {editRule ? "Update rule details and formatting" : "Create a new rule with rich formatting"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., Player Eligibility Requirements"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Description *
            </label>
            
            {/* Rich Text Editor Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-slate-50 border border-slate-300 border-b-0 rounded-t-lg">
              <ToolbarButton
                onClick={() => wrapSelectedText("**")}
                title="Bold (wrap with **)"
                icon={<span className="font-bold text-sm">B</span>}
              />
              <ToolbarButton
                onClick={() => wrapSelectedText("*")}
                title="Italic (wrap with *)"
                icon={<span className="italic text-sm">I</span>}
              />
              <div className="w-px h-5 bg-slate-300 mx-1"></div>
              <ToolbarButton
                onClick={addBulletPoint}
                title="Bullet Point"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                }
              />
              <ToolbarButton
                onClick={addNumberedPoint}
                title="Numbered List"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                }
              />
              <div className="w-px h-5 bg-slate-300 mx-1"></div>
              <ToolbarButton
                onClick={() => insertTextAtCursor("\n")}
                title="New Line"
                icon={<span className="text-xs">↵</span>}
              />
              <div className="flex-1"></div>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  showPreview 
                    ? "bg-blue-600 text-white" 
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                {showPreview ? "Edit" : "Preview"}
              </button>
            </div>

            {/* Editor / Preview Area */}
            {showPreview ? (
              <div className="w-full px-4 py-3 border border-slate-300 rounded-b-lg bg-white min-h-[150px] max-h-[250px] overflow-y-auto">
                {renderPreview(formData.description)}
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                placeholder="Enter rule description...

Use formatting:
• **bold text** for important info
• *italic text* for emphasis
• - or • for bullet points
• 1. 2. 3. for numbered lists"
              />
            )}

            {/* Formatting Help */}
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs font-semibold text-blue-800 mb-1">Formatting Tips:</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-blue-700">
                <span>• <code className="bg-blue-100 px-1 rounded">**text**</code> → <strong>bold</strong></span>
                <span>• <code className="bg-blue-100 px-1 rounded">*text*</code> → <em>italic</em></span>
                <span>• <code className="bg-blue-100 px-1 rounded">- item</code> → bullet point</span>
                <span>• <code className="bg-blue-100 px-1 rounded">1. item</code> → numbered list</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Sport *
              </label>
              <select
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                {SPORTS.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Display Order
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              min="0"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0 (lower numbers appear first)"
            />
            <p className="text-xs text-slate-500 mt-1">Rules are sorted by this number within each category</p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : editRule ? "Update Rule" : "Add Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
