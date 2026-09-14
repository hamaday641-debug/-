import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Copy, 
  Check, 
  HelpCircle,
  BookmarkCheck,
  Compass,
  FileText,
  Share2
} from 'lucide-react';
import { AIMessage } from '../types';
import { findSmartIslamicAnswer } from '../data/islamicKnowledgeBase';

export const AIScholarView: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>(() => {
    try {
      const saved = localStorage.getItem('nour_ai_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: `السلام عليكم ورحمة الله وبركاته 🌿
مرحباً بك في **المرشد القرآني والإسلامي الذكي**.
أنا هنا لمساعدتك في:
- 📖 **تفسير الآيات القرآنية** ومعاني المفردات وتدبرها.
- 📜 **تخريج الأحاديث النبوية الشريفة** وصحتها وشرحها.
- 🤲 **أدعية القرآن والسنة** ومواطن استجابتها.
- 🕌 **أحكام العبادات والآداب الإسلامية العامة** من مصادرها المعتمدة.

📌 **ملاحظة أمانة شرعية:** ألتزم بذكر **السورة والآية، وتخريج الحديث، واسم المفسر أو الكتاب المعتمد** في كل رد. الفتاوى الشخصية الحساسة والنوازل يُرجى استشارة دار الإفتاء والعلماء المختصين بها.`,
        timestamp: Date.now()
      }
    ];
  });

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('nour_ai_chat_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickQuestions = [
    'ما تفسير قوله تعالى: ﴿إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾؟',
    'ما صحة حديث: «أحب الأعمال إلى الله أدومها وإن قل» وشرحه؟',
    'ما هي السور والآيات التي يستحب قراءتها قبل النوم؟',
    'ما هو فضل سورة الكهف يوم الجمعة مع الدليل؟',
    'كيف كان هدي النبي ﷺ في قيام الليل والوتر؟'
  ];

  const handleAsk = async (textToAsk?: string) => {
    const query = (textToAsk || inputQuestion).trim();
    if (!query || isLoading) return;

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          history: messages.slice(-4)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'تعذر الحصول على إجابة');
      }

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || 'لم يتم العثور على إجابة مفصلة.',
        timestamp: Date.now()
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      // Check if we have an instant authoritative Islamic knowledge base match
      const fallbackAnswer = findSmartIslamicAnswer(query);
      if (fallbackAnswer) {
        const fallbackMsg: AIMessage = {
          id: `ai-kb-${Date.now()}`,
          sender: 'ai',
          text: fallbackAnswer,
          timestamp: Date.now()
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } else {
        const errorMsg: AIMessage = {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `عذراً، لم نتمكن من الاتصال بخدمة الذكاء الاصطناعي حالياً (${err.message || 'خطأ في الشبكة'}). يرجى طرح السؤال مرة أخرى أو اختيار أحد الأسئلة المقترحة الموثقة أعلاه.`,
          timestamp: Date.now(),
          isError: true
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('هل تود مسح سجل المحادثة والبدء من جديد؟')) {
      setMessages([
        {
          id: 'msg-welcome-new',
          sender: 'ai',
          text: 'تم مسح السجل السابق. تفضل بطرح سؤالك الديني أو طلب تفسير أي آية أو حديث.',
          timestamp: Date.now()
        }
      ]);
    }
  };

  // Helper to render basic markdown formatting cleanly
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Heading
      if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
        const cleanHeading = line.replace(/^#+\s*/, '');
        return (
          <h4 key={idx} className="font-bold text-sm sm:text-base text-[#1B3022] dark:text-[#E9B161] mt-3 mb-1.5 flex items-center gap-1.5 border-r-2 border-[#E9B161] pr-2">
            {cleanHeading}
          </h4>
        );
      }

      // Quran quote or special quote
      if (line.includes('﴿') && line.includes('﴾')) {
        return (
          <p key={idx} className="my-2.5 p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 text-emerald-950 dark:text-amber-200 font-scheherazade text-lg leading-relaxed text-center font-semibold">
            {line}
          </p>
        );
      }

      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const cleanBullet = line.trim().substring(2);
        return (
          <li key={idx} className="mr-4 my-1 text-xs sm:text-sm list-disc leading-relaxed text-stone-800 dark:text-stone-200">
            {formatBold(cleanBullet)}
          </li>
        );
      }

      // References footer section highlight
      if (line.includes('المصادر والمراجع') || line.includes('المصدر:')) {
        return (
          <div key={idx} className="mt-3 pt-2 border-t border-[#E9B161]/30 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{line}</span>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-1.5"></div>;
      }

      return (
        <p key={idx} className="text-xs sm:text-sm leading-relaxed my-1 text-stone-800 dark:text-stone-200">
          {formatBold(line)}
        </p>
      );
    });
  };

  const formatBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-[#1B3022] dark:text-[#E9B161]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 min-h-[calc(100vh-4rem)] flex flex-col font-cairo">
      {/* Header Banner */}
      <div className="mb-4 p-4 rounded-3xl bg-gradient-to-br from-[#1B3022] via-[#243D2C] to-[#122317] border border-[#3D5A47] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-right">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E9B161] to-[#C99141] text-[#1B3022] flex items-center justify-center shadow-lg shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base sm:text-lg text-[#E9B161]">المرشد الإسلامي الذكي</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3D5A47] text-white font-medium">
                بالذكاء الاصطناعي مع المصادر 📚
              </span>
            </div>
            <p className="text-xs text-[#A8BCAD] mt-0.5">
              إجابات دينية موثقة بآيات القرآن، وتخريج الأحاديث، وتفاسير أئمة أهل السنة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2D4536]/80 hover:bg-[#2D4536] border border-[#3D5A47] text-xs text-[#A8BCAD] hover:text-white transition-colors"
            title="مسح المحادثة"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>محادثة جديدة</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-[#1B3022] dark:text-[#E9B161] mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#E9B161]" />
          <span>أسئلة شائعة وتدبرات مقترحة:</span>
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleAsk(q)}
              disabled={isLoading}
              className="shrink-0 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-[#1B3022] hover:bg-[#E9B161]/20 hover:border-[#E9B161] border border-stone-200 dark:border-[#2D4536] text-xs text-stone-700 dark:text-stone-200 transition-all text-right"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List Container */}
      <div className="flex-1 bg-white dark:bg-[#142318] rounded-3xl border border-stone-200 dark:border-[#2D4536] p-4 sm:p-5 shadow-sm space-y-4 overflow-y-auto mb-4 min-h-[380px]">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  isAI
                    ? 'bg-gradient-to-br from-[#1B3022] to-[#2D4536] text-[#E9B161] border border-[#3D5A47]'
                    : 'bg-gradient-to-br from-[#E9B161] to-[#C99141] text-[#1B3022]'
                }`}
              >
                {isAI ? <Bot className="w-5 h-5" /> : <span className="text-xs font-bold">أنت</span>}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-3xl p-4 text-right shadow-sm ${
                  isAI
                    ? msg.isError
                      ? 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-200'
                      : 'bg-stone-50 dark:bg-[#1A2D20] border border-stone-200/80 dark:border-[#2D4536]'
                    : 'bg-gradient-to-r from-[#1B3022] to-[#243D2C] text-white'
                }`}
              >
                <div className="space-y-1">
                  {renderFormattedText(msg.text)}
                </div>

                {/* Bubble Footer / Actions */}
                <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-stone-400 dark:text-[#A8BCAD]">
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>

                  {isAI && !msg.isError && (
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="flex items-center gap-1 hover:text-[#E9B161] transition-colors p-1 rounded"
                      title="نسخ الإجابة"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>نسخ الإجابة</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#1B3022] to-[#2D4536] text-[#E9B161] border border-[#3D5A47] flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 rounded-3xl bg-stone-50 dark:bg-[#1A2D20] border border-stone-200 dark:border-[#2D4536] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E9B161] animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-[#E9B161] animate-bounce delay-150"></span>
              <span className="w-2 h-2 rounded-full bg-[#E9B161] animate-bounce delay-300"></span>
              <span className="text-xs text-[#A8BCAD] mr-2">جاري البحث وتخريج المصادر الشرعية الموثوقة...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="relative flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="اكتب سؤالك الديني، آية لتفسيرها، أو حديث لتخريجه..."
          disabled={isLoading}
          className="flex-1 bg-white dark:bg-[#142318] border border-stone-300 dark:border-[#2D4536] rounded-2xl py-3.5 pr-4 pl-12 text-sm text-[#1B3022] dark:text-white placeholder:text-stone-400 dark:placeholder:text-[#A8BCAD] focus:outline-none focus:ring-2 focus:ring-[#E9B161] shadow-md transition-all"
        />

        <button
          type="submit"
          disabled={!inputQuestion.trim() || isLoading}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#E9B161] hover:bg-[#D99A45] disabled:opacity-40 disabled:hover:bg-[#E9B161] text-[#1B3022] flex items-center justify-center shadow-md transition-all active:scale-95"
          title="إرسال السؤال"
        >
          <Send className="w-4 h-4 rotate-180" />
        </button>
      </form>
    </div>
  );
};
