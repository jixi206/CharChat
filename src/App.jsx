import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import ChatScreen from './components/ChatScreen';
import CreateCharacterScreen from './components/CreateCharacterScreen';

import SettingsScreen from './components/SettingsScreen';

function App() {
  const DEFAULT_CHARACTERS = [
    {
      id: 'default-study',
      name: 'Study Buddy',
      tagline: 'strict, focused, mentor, motivating',
      description: 'Your no-nonsense study partner who keeps you locked in and holds you accountable. Zero tolerance for procrastination, maximum results.',
      avatarColor: '#3b82f6',
      avatarImage: null,
      greeting: "Alright, let's get to work. What are you studying today? No excuses — just progress. 📚"
    },
    {
      id: 'default-funny',
      name: 'Funny Friend',
      tagline: 'funny, chaotic, goofy, comedian, humor',
      description: 'The unhinged class clown who turns everything into a bit. Absolutely cannot be serious for more than 3 seconds.',
      avatarColor: '#f59e0b',
      avatarImage: null,
      greeting: "YO okay I have a very important question and it cannot wait — would you rather fight a giant hamster or 1000 hamster-sized giants? 🐹"
    },
    {
      id: 'default-comfort',
      name: 'Comfort Friend',
      tagline: 'caring, sweet, kind, soft, gentle',
      description: 'Your warm, always-there-for-you friend who never judges. Whether you need to vent or just feel heard, Skye is your safe space.',
      avatarColor: '#ec4899',
      avatarImage: null,
      greeting: "Hey you 🥰 I'm so glad you're here. How are you really doing today? I've got all the time in the world for you 💕"
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
