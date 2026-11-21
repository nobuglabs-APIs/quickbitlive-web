import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  Bot,
  Send,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { irisService } from '../../services/iris.service';
import { IrisWidgetConfigurator, IrisWidgetConfiguratorState } from '../../components/widget/IrisWidgetConfigurator';

interface ChatMessage {
  sender: 'iris' | 'user';
  text: string;
}

export const WidgetCustomizerView: React.FC = () => {
  const { activeProject } = useAuth();

  const projectId = activeProject?.id || '';

  // Widget preview interactive chat
  const [previewMessages, setPreviewMessages] = useState<ChatMessage[]>([
    {
      sender: 'iris',
      text: 'Hi! I am Iris. Tell me what you love, what breaks, or what feature you need next!',
    },
  ]);
  const [testInput, setTestInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  const handleTestChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const userText = testInput.trim();
    setPreviewMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setTestInput('');
    setIsChatting(true);

    try {
      const res = await irisService.widgetChat({
        project_id: projectId,
        message: userText,
      });

      const replyText =
        res.reply ||
        res.response ||
        res.message ||
        "Iris processed your message. On-demand chat replies require a configured widget endpoint.";

      setPreviewMessages((prev) => [...prev, { sender: 'iris', text: replyText }]);
    } catch {
      // Fail honestly: do not claim the feedback was captured when the widget backend is unavailable.
      setPreviewMessages((prev) => [
        ...prev,
        {
          sender: 'iris',
          text: "I couldn't reach the widget backend to process that message. Please ensure the QuickBit widget is installed and configured.",
        },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-light dark:border-ink-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-ink dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-brand dark:text-indigo-400" />
            Iris Mascot & Widget Customizer
          </h1>
          <p className="text-xs text-muted dark:text-slate-400 mt-1">
            Configure the aesthetic skin, tone of voice, animations, and color scheme for your embedded feedback widget.
          </p>
        </div>
      </div>

      {/* Main layout: Config Controls & Live Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <IrisWidgetConfigurator
          renderPreview={(state) => (
            <WidgetChatPreview
              state={state}
              messages={previewMessages}
              isChatting={isChatting}
              testInput={testInput}
              onTestInputChange={setTestInput}
              onSend={handleTestChat}
            />
          )}
        />
      </div>
    </div>
  );
};

const WidgetChatPreview: React.FC<{
  state: IrisWidgetConfiguratorState;
  messages: ChatMessage[];
  isChatting: boolean;
  testInput: string;
  onTestInputChange: (v: string) => void;
  onSend: (e: React.FormEvent) => void;
}> = ({ state, messages, isChatting, testInput, onTestInputChange, onSend }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between px-1">
      <span className="text-xs font-bold uppercase tracking-wider text-muted dark:text-slate-400 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-brand dark:text-indigo-400" />
        Live Widget Preview
      </span>
      <Badge variant="accent" size="sm">
        Skin: {state.skin}
      </Badge>
    </div>

    {/* Embedded widget simulation box */}
    <div className="w-full bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[520px]">
      {/* Widget Header */}
      <div
        style={{ backgroundColor: state.primaryColor }}
        className="p-4 text-white flex items-center justify-between shadow-2xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">Iris Assistant</div>
            <div className="text-[10px] text-white/80 capitalize">{state.tone} • {state.formality}</div>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Chat Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface dark:bg-[#090D16] text-xs">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand text-white rounded-br-xs shadow-2xs'
                  : 'bg-white dark:bg-ink-2 border border-line dark:border-slate-800 text-ink dark:text-white rounded-bl-xs shadow-2xs'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isChatting && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-ink-2 border border-line dark:border-slate-800 p-2.5 rounded-2xl rounded-bl-xs text-[11px] text-muted dark:text-slate-400 animate-pulse">
              Iris is typing...
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <form onSubmit={onSend} className="p-3 bg-white dark:bg-ink border-t border-line-light dark:border-ink-2 flex items-center gap-2">
        <input
          value={testInput}
          onChange={(e) => onTestInputChange(e.target.value)}
          placeholder="Test sending customer feedback..."
          className="flex-1 text-xs bg-surface dark:bg-ink-2 border border-line dark:border-slate-700 rounded-xl px-3 py-2 text-ink dark:text-white placeholder:text-muted-light dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <button
          type="submit"
          disabled={!testInput.trim() || isChatting}
          className="p-2 bg-brand text-white rounded-xl hover:bg-brand-hover disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  </div>
);