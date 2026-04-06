import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, Key, Loader2 } from 'lucide-react';

export default function AIAsystentView() {
  const [userKey, setUserKey] = useState(localStorage.getItem('gemini_api_key') || "");
  const [showLocalConfig, setShowLocalConfig] = useState(false);
  
  const [msg, setMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chat, setChat] = useState([
    { role: 'ai', text: 'Cześć! Działam teraz na bezpiecznym serwerze w chmurze (Backend). Zapytaj mnie o cokolwiek! ⛰️' }
  ]);
  const endRef = useRef(null);
  
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [chat, isTyping]);

  const saveUserKey = () => {
    if(userKey.trim().length > 20) {
      localStorage.setItem('gemini_api_key', userKey.trim());
      setShowLocalConfig(false);
    }
  };

  const send = async () => {
    if(!msg.trim()) return;
    
    const currentMsg = msg;
    setChat(prev => [...prev, { role: 'user', text: currentMsg }]);
    setMsg("");
    setIsTyping(true);

    try {
      let aiText = "";

      // 1. Zabezpieczenie: Jeśli uruchamiasz apkę u siebie na domowym komputerze (localhost)
      if (userKey && showLocalConfig === false) {
         const systemPrompt = "Jesteś przewodnikiem po Beskidach...";
         const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${userKey}`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt + "\n\n" + currentMsg }] }] })
         });
         const data = await response.json();
         if(data.error) throw new Error(data.error.message);
         aiText = data.candidates[0].content.parts[0].text;
      } 
      // 2. PRODUKCJA: Użytkownik w internecie (korzysta z Twojego bezpiecznego serwera Vercel)
      else {
         const response = await fetch('/api/chat', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ message: currentMsg })
         });
         const data = await response.json();
         if (data.error) throw new Error(data.error);
         aiText = data.reply;
      }

      setChat(c => [...c, { role: 'ai', text: aiText }]);
    } catch (err) {
      console.error(err);
      setChat(c => [...c, { role: 'ai', text: "Błąd: " + err.message }]);
    } finally {
      setIsTyping(false);
    }
  };

  // EKRAN DLA TESTÓW LOKALNYCH (Zignoruj go na Vercel)
  if (showLocalConfig) {
    return (
      <div className="p-6 h-full flex flex-col justify-center animate-in fade-in bg-gray-50 pb-20">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
           <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600"><Key size={32}/></div>
           <h2 className="text-2xl font-black text-gray-800 mb-2">Lokalne Testy AI</h2>
           <p className="text-sm text-gray-500 mb-6">Aplikacja w internecie korzysta z bezpiecznego backendu. Jeśli chcesz testować u siebie na komputerze, wklej tu klucz.</p>
           <input type="password" value={userKey} onChange={e => setUserKey(e.target.value)} placeholder="AIzaSy..." className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200 outline-none mb-4" />
           <div className="flex gap-2">
             <button onClick={() => setShowLocalConfig(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-xl">Zamknij</button>
             <button onClick={saveUserKey} className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-xl">Zapisz Testowy Klucz</button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 relative animate-in fade-in">
      <div className="bg-emerald-600 pt-6 pb-4 px-4 shadow-md z-10 rounded-b-3xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-2xl text-white flex items-center gap-2"><Sparkles size={24} className="text-yellow-300"/> Asystent AI</h2>
            <p className="text-emerald-100 text-[10px] uppercase font-bold tracking-wider mt-1">Vercel Secure Backend</p>
          </div>
          <button onClick={() => setShowLocalConfig(true)} className="bg-emerald-700 p-2 rounded-full text-emerald-200 hover:text-white transition">
            <Key size={16}/>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {chat.map((c, i) => (
          <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            {c.role === 'ai' && <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2 shrink-0"><Bot size={16} className="text-emerald-600"/></div>}
            <div 
              className={`max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${c.role === 'user' ? 'bg-gray-900 text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'}`}
              dangerouslySetInnerHTML={{__html: c.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>')}}
            />
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
             <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2 shrink-0"><Bot size={16} className="text-emerald-600"/></div>
             <div className="bg-white px-4 py-3 rounded-3xl rounded-tl-sm shadow-sm border border-gray-100 flex gap-2 items-center">
               <Loader2 size={16} className="animate-spin text-emerald-500" />
               <span className="text-xs text-gray-500 font-medium">Gemini myśli...</span>
             </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent z-10">
        <div className="flex gap-2 bg-white p-2 rounded-full shadow-lg border border-gray-100 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
          <input 
            value={msg} 
            onChange={e=>setMsg(e.target.value)} 
            onKeyDown={e=>e.key==='Enter'&&send()} 
            className="flex-1 bg-transparent px-4 text-sm font-medium focus:outline-none" 
            placeholder="Zapytaj o trasę, jedzenie..." 
            disabled={isTyping}
          />
          <button onClick={send} disabled={isTyping || !msg.trim()} className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-300 transition-colors text-white p-3 rounded-full shadow-md"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}