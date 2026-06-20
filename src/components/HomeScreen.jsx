
import { Plus, Edit2, Trash2, RefreshCw, Settings } from 'lucide-react';

function HomeScreen({ characters, onSelectCharacter, onCreateClick, onEditCharacter, onDeleteCharacter, onRefreshChat, onOpenSettings, theme, onToggleTheme }) {
  return (
    <div className="home-screen">
      <div className="home-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="home-title">My AI Friends</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="theme-toggle">
            <button 
              className="toggle-switch" 
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              <div className="toggle-knob">
                <span className="toggle-icon">{theme === 'light' ? '☀️' : '🌙'}</span>
              </div>
            </button>
          </div>
          <button className="icon-btn" onClick={onOpenSettings} aria-label="Settings">
            <Settings size={24} />
          </button>
        </div>
      </div>
      
      <button className="create-btn-full" onClick={onCreateClick}>
        <Plus size={20} /> Create New Character
      </button>

      {characters.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any characters yet.</p>
          <p>Click the button above to make your first AI friend!</p>
        </div>
      ) : (
        <div className="character-list">
          {characters.map((character) => (
            <div 
              key={character.id} 
              className="character-card"
              onClick={() => onSelectCharacter(character.id)}
            >
              <div 
                className="avatar" 
                style={{ 
                  backgroundColor: character.avatarColor,
                  backgroundImage: character.avatarImage ? `url(${character.avatarImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!character.avatarImage && character.name.charAt(0)}
              </div>
              <div className="character-info">
                <h2 className="character-name">{character.name}</h2>
                <p className="character-tagline">{character.tagline || character.description}</p>
              </div>
              
              <div className="card-actions">
                <button 
                  className="icon-btn" 
                  onClick={(e) => { e.stopPropagation(); onRefreshChat(character.id); }}
                  title="Refresh Chat History"
                  aria-label="Refresh Chat"
                >
                  <RefreshCw size={16} />
                </button>
                <button 
                  className="icon-btn" 
                  onClick={(e) => { e.stopPropagation(); onEditCharacter(character); }}
                  title="Edit Character"
                  aria-label="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="icon-btn delete-btn" 
                  onClick={(e) => { e.stopPropagation(); onDeleteCharacter(character.id); }}
                  title="Delete Character"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomeScreen;
