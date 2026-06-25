import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import ChatScreen from './components/ChatScreen';
import CreateCharacterScreen from './components/CreateCharacterScreen';

import SettingsScreen from './components/SettingsScreen';

function App() {
  const DEFAULT_CHARACTERS = [
    {
      id: 'default-study',
      name: '📚 Study Mentor',
      tagline: 'focused, wise, structured, motivating, mentor',
      description: 'Your dedicated study mentor who keeps you on track and pushes you to reach your full potential. Structured guidance, zero procrastination, maximum growth.',
      avatarColor: '#3b82f6',
      avatarImage: null,
      greeting: "Hey there, scholar! 📚 Ready to make today count? Tell me what you're working on and we'll build a game plan together. No stress — just steady progress."
    },
    {
      id: 'default-funny',
      name: '✨ Chaotic Bestie',
      tagline: 'funny, chaotic, goofy, unhinged, comedian, bestie',
      description: 'Your unhinged, loveable chaos agent who turns everything into a moment. Cannot be serious for more than 3 seconds and honestly? That\'s the point.',
      avatarColor: '#f59e0b',
      avatarImage: null,
      greeting: "BESTIE you have NO idea how long I've been waiting for you to show up 😭✨ okay okay IMPORTANT question — pineapple on pizza, yes or we can't be friends? 🍍"
    },
    {
      id: 'default-comfort',
      name: '🌙 Comfort Companion',
      tagline: 'caring, sweet, kind, soft, gentle, safe, warm',
      description: 'Your warm, always-there-for-you companion who never judges. Whether you need to vent, feel heard, or just want a cozy chat — this is your safe space.',
      avatarColor: '#ec4899',
      avatarImage: null,
      greeting: "Hey, you 🌙 I'm really glad you're here. How are you feeling today — like, really? Take your time. I've got all the space in the world for you 💕"
    }
  ];


  const [characters, setCharacters] = useState(() => {
    const saved = localStorage.getItem('charchat_characters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse characters", e);
      }
    }
    return DEFAULT_CHARACTERS; // Show 3 default characters for new users
  });

  const [activeChatId, setActiveChatId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);

  // Theme state — persisted in localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('charchat_theme') || 'light';
  });

  // Apply theme to the <html> element whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('charchat_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    localStorage.setItem('charchat_characters', JSON.stringify(characters));
  }, [characters]);

  const activeCharacter = characters.find(c => c.id === activeChatId);

  const handleSaveCharacter = (character) => {
    if (editingCharacter) {
      setCharacters(characters.map(c => c.id === character.id ? character : c));
    } else {
      setCharacters([...characters, character]);
    }
    setIsCreating(false);
    setEditingCharacter(null);
  };

  const handleDeleteCharacter = (id) => {
    // 1. Remove from the characters array
    setCharacters(characters.filter(c => c.id !== id));
    
    // 2. Remove the chat history and memory from localStorage to prevent junk data buildup
    localStorage.removeItem(`charchat_history_${id}`);
    localStorage.removeItem(`charchat_memory_${id}`);
    
    // 3. Close the chat if we were currently talking to them
    if (activeChatId === id) setActiveChatId(null);
  };

  const handleEditCharacter = (character) => {
    setEditingCharacter(character);
    setIsCreating(true);
  };

  const handleRefreshChat = (id) => {
    if (window.confirm("Are you sure you want to clear this chat history? This cannot be undone.")) {
      localStorage.removeItem(`charchat_history_${id}`);
      localStorage.removeItem(`charchat_memory_${id}`);
    }
  };

  return (
    <div className="app-container">
      {isSettingsOpen ? (
        <SettingsScreen onBack={() => setIsSettingsOpen(false)} />
      ) : isCreating ? (
        <CreateCharacterScreen
          initialData={editingCharacter}
          onBack={() => {
            setIsCreating(false);
            setEditingCharacter(null);
          }}
          onSave={handleSaveCharacter}
        />
      ) : activeChatId ? (
        <ChatScreen 
          character={activeCharacter} 
          onBack={() => setActiveChatId(null)} 
        />
      ) : (
        <HomeScreen 
          characters={characters} 
          onSelectCharacter={setActiveChatId}
          onCreateClick={() => setIsCreating(true)}
          onEditCharacter={handleEditCharacter}
          onDeleteCharacter={handleDeleteCharacter}
          onRefreshChat={handleRefreshChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}

export default App;
