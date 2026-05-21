import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function CreateRoomForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [collector, setCollector] = useState('');
  const [password, setPassword] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !collector || !password) return;
    setCreating(true);
    const form = new FormData();
    form.append('title', title);
    form.append('collector_name', collector);
    form.append('password', password);
    form.append('description', description);
    try {
      await axios.post(`${API}/api/commissions`, form);
      setTitle(''); setCollector(''); setPassword(''); setDescription('');
      onCreated();
    } catch {
      alert('Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 space-y-4">
      <h2 className="text-white text-lg font-semibold">Create Commission Room</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Room title (e.g. Norrie Commission)" required
          className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-gray-500"
        />
        <input
          type="text" value={collector} onChange={(e) => setCollector(e.target.value)}
          placeholder="Collector name" required
          className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-gray-500"
        />
        <input
          type="text" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Room password (share with collector)" required
          className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-gray-500"
        />
        <input
          type="text" value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-gray-500"
        />
      </div>
      <button
        type="submit" disabled={creating}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-40"
      >
        {creating ? 'Creating...' : 'Create Room'}
      </button>
    </form>
  );
}

function RoomDetail({ room, onBack, onRefresh }) {
  const [artworks, setArtworks] = useState(room.artworks || []);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const fileRef = useRef(null);

  const fetchRoom = async () => {
    const { data } = await axios.get(`${API}/api/commissions/${room.id}`);
    setArtworks(data.artworks || []);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('title', title || file.name);
    form.append('description', description);
    form.append('uploaded_by', 'Artist');
    try {
      await axios.post(`${API}/api/commissions/${room.id}/artworks`, form);
      setTitle(''); setDescription('');
      fileRef.current.value = '';
      fetchRoom();
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteArtwork = async (artworkId) => {
    if (!confirm('Delete this artwork?')) return;
    await axios.delete(`${API}/api/commissions/${room.id}/artworks/${artworkId}`);
    fetchRoom();
  };

  const postArtistComment = async (artworkId, text) => {
    if (!text.trim()) return;
    await axios.post(`${API}/api/commissions/${room.id}/artworks/${artworkId}/comments`, {
      text, author: 'Artist', password: '',
    });
    fetchRoom();
  };

  const shareUrl = `${window.location.origin}/commission/${room.id}`;

  return (
    <div>
      <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1">
        &larr; Back to rooms
      </button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold">{room.title}</h2>
          <p className="text-gray-400 text-sm">for {room.collector_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={shareUrl} readOnly
            className="bg-gray-900 border border-gray-700 text-gray-300 px-3 py-2 rounded-lg text-xs w-72"
          />
          <button
            onClick={() => { navigator.clipboard.writeText(shareUrl); }}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg text-xs hover:bg-gray-600"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Upload form */}
      <form onSubmit={handleUpload} className="bg-gray-800 rounded-xl p-5 mb-8 space-y-3">
        <h3 className="text-white text-sm font-semibold">Upload Artwork</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm flex-1 min-w-[150px] focus:outline-none focus:border-gray-500"
          />
          <input
            type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm flex-1 min-w-[150px] focus:outline-none focus:border-gray-500"
          />
          <input
            ref={fileRef} type="file" accept="image/*,video/*"
            className="text-gray-400 text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white file:cursor-pointer"
          />
          <button
            type="submit" disabled={uploading}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 disabled:opacity-40"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>

      {/* Artworks grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {artworks.map((art) => (
          <ArtworkAdminCard
            key={art.id}
            artwork={art}
            onDelete={() => deleteArtwork(art.id)}
            onComment={(text) => postArtistComment(art.id, text)}
          />
        ))}
      </div>

      {artworks.length === 0 && (
        <p className="text-gray-500 text-center py-10">No artworks yet. Upload the first one above.</p>
      )}
    </div>
  );
}

function ArtworkAdminCard({ artwork, onDelete, onComment }) {
  const [commentText, setCommentText] = useState('');

  const handleComment = (e) => {
    e.preventDefault();
    onComment(commentText);
    setCommentText('');
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="aspect-square bg-black flex items-center justify-center">
        {artwork.media_type === 'video' ? (
          <video src={`${API}/uploads/${artwork.filename}`} controls className="w-full h-full object-contain" />
        ) : (
          <img src={`${API}/uploads/${artwork.filename}`} alt={artwork.title} className="w-full h-full object-contain" />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-white font-medium">{artwork.title}</h4>
            <span className={`text-xs uppercase tracking-wider ${
              artwork.uploaded_by === 'Artist' ? 'text-amber-400' : 'text-sky-400'
            }`}>
              {artwork.uploaded_by}
            </span>
          </div>
          <button onClick={onDelete} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
        </div>

        {artwork.description && (
          <p className="text-gray-400 text-sm mb-3">{artwork.description}</p>
        )}

        {/* Comments */}
        <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
          {artwork.comments?.map((c) => (
            <div key={c.id} className={`rounded-lg px-3 py-2 text-sm ${
              c.author === 'Artist' ? 'bg-gray-900' : 'bg-gray-700/50'
            }`}>
              <span className={`text-xs font-medium uppercase tracking-wider mr-2 ${
                c.author === 'Artist' ? 'text-amber-400' : 'text-sky-400'
              }`}>
                {c.author}
              </span>
              <span className="text-gray-300">{c.text}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleComment} className="flex gap-2">
          <input
            type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
            placeholder="Reply as Artist..."
            className="flex-1 bg-gray-900 border border-gray-700 text-white px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-gray-500"
          />
          <button
            type="submit" disabled={!commentText.trim()}
            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-500 disabled:opacity-40"
          >
            Reply
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CommissionAdmin() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const fetchRooms = async () => {
    const { data } = await axios.get(`${API}/api/commissions`);
    setRooms(data);
  };

  const fetchRoomDetail = async (roomId) => {
    const { data } = await axios.get(`${API}/api/commissions/${roomId}`);
    setSelectedRoom(data);
  };

  const deleteRoom = async (roomId) => {
    if (!confirm('Delete this commission room and all its artworks?')) return;
    await axios.delete(`${API}/api/commissions/${roomId}`);
    fetchRooms();
  };

  useEffect(() => { fetchRooms(); }, []);

  if (selectedRoom) {
    return (
      <RoomDetail
        room={selectedRoom}
        onBack={() => { setSelectedRoom(null); fetchRooms(); }}
        onRefresh={() => fetchRoomDetail(selectedRoom.id)}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Commission Rooms</h1>

      <CreateRoomForm onCreated={fetchRooms} />

      <div className="mt-8 space-y-3">
        {rooms.map((room) => (
          <div key={room.id} className="bg-gray-800 rounded-xl p-5 flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">{room.title}</h3>
              <p className="text-gray-400 text-sm">
                {room.collector_name} &middot; {room.artwork_count} artwork{room.artwork_count !== 1 ? 's' : ''}
                &middot; {new Date(room.created_at).toLocaleDateString('en-GB')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchRoomDetail(room.id)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600"
              >
                Open
              </button>
              <button
                onClick={() => deleteRoom(room.id)}
                className="bg-red-900/50 text-red-300 px-4 py-2 rounded-lg text-sm hover:bg-red-900"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {rooms.length === 0 && (
          <p className="text-gray-500 text-center py-6">No commission rooms yet. Create one above.</p>
        )}
      </div>
    </div>
  );
}
