import { useState, useRef } from 'react';
import { ArrowLeft, Upload, Check } from 'lucide-react';

function CreateCharacterScreen({ initialData, onBack, onSave }) {
  const [name, setName] = useState(initialData?.name || '');
  const [traits, setTraits] = useState(initialData?.tagline || ''); 
  const [bio, setBio] = useState(initialData?.description || '');
  const [greeting, setGreeting] = useState(initialData?.greeting || '');
  const [avatarImage, setAvatarImage] = useState(initialData?.avatarImage || null);
  
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#ef4444'];
    const randomColor = initialData?.avatarColor || colors[Math.floor(Math.random() * colors.length)];

    const defaultGreeting = `Hi! I am ${name.trim()}.`;

    const newCharacter = {
      id: initialData?.id || `custom-${Date.now()}`,
      name: name.trim(),
      tagline: traits.trim(),
      description: bio.trim(),
      avatarColor: randomColor,
      avatarImage: avatarImage,
      greeting: greeting.trim() || defaultGreeting
    };

    onSave(newCharacter);
  };

  return (
    <div className="create-screen">
      <div className="app-header">
        <button className="back-btn" onClick={onBack} type="button" aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
        <h2 className="header-title">{initialData ? 'Edit Character' : 'Create Character'}</h2>
      </div>

      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-group image-upload-group">
          <div 
            className="image-preview" 
            onClick={() => fileInputRef.current?.click()}
            style={{ backgroundImage: avatarImage ? `url(${avatarImage})` : 'none' }}
          >
            {!avatarImage && (
              <div className="upload-placeholder">
                <Upload size={32} />
                <span>Upload Photo</span>
              </div>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden-input" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
        </div>

        <div className="form-group">
          <label>Character Name *</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Zoya"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Personality Traits</label>
          <input 
            type="text" 
            value={traits} 
            onChange={(e) => setTraits(e.target.value)} 
            placeholder="e.g. funny, sarcastic, caring"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Short Bio / Description</label>
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            placeholder="e.g. My chaotic bestie who always has tea to spill"
            className="form-input form-textarea"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Optional Greeting Message</label>
          <input 
            type="text" 
            value={greeting} 
            onChange={(e) => setGreeting(e.target.value)} 
            placeholder="e.g. Finally you're here 😭 what happened?"
            className="form-input"
          />
        </div>

        <button type="submit" className="save-btn" disabled={!name.trim()}>
          <Check size={20} /> {initialData ? 'Save Changes' : 'Create AI Friend'}
        </button>
      </form>
    </div>
  );
}

export default CreateCharacterScreen;
