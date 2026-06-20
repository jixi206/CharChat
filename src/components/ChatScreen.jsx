import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { generateCharacterReply } from '../ai';

function ChatScreen({ character, onBack }) {
  const storageKey = `charchat_history_${character.id}`;
  
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [{ id: 1, text: character.greeting, sender: 'ai' }];
  });
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Save chat history automatically
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    // 1. Add user message to state
    const userMsg = { id: Date.now(), text: inputValue.trim(), sender: 'user' };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    
    // 2. Show typing indicator
    setIsTyping(true);

    // 3. Call Real AI via Gemini API
    // We pass the newMessages array so the AI has the full context of the chat
    const aiResponseText = await generateCharacterReply(character, newMessages);
    
    // 4. Hide typing indicator and show AI response
    setIsTyping(false);
    const aiMsg = { 
      id: Date.now() + 1, 
      text: aiResponseText, 
      sender: 'ai' 
    };
    setMessages(prev => [...prev, aiMsg]);
  };

  return (
    <div className="chat-screen">
      <div className="app-header">
        <button className="back-btn" onClick={onBack} aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
        <div 
          className="avatar avatar-small" 
          style={{ 
            backgroundColor: character.avatarColor,
            backgroundImage: character.avatarImage ? `url(${character.avatarImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!character.avatarImage && character.name.charAt(0)}
        </div>
        <div style={{flex: 1}}>
          <h2 className="header-title" style={{marginBottom: 0}}>{character.name}</h2>
          <p style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
            {isTyping ? 'typing...' : 'Online'}
          </p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`message ${msg.sender === 'ai' ? 'message-ai' : 'message-user'}`}
          >
            {msg.text}
          </div>
        ))}
        
        {isTyping && (
          <div className="message message-ai typing-indicator">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-container" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isTyping}
        />
        <button 
          type="submit" 
          className="send-btn"
          disabled={!inputValue.trim() || isTyping}
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}

export default ChatScreen;
