import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Plus, Edit, Trash2, RefreshCw, Music, Play, Upload, Save } from 'lucide-react';
import { sanityClient } from '../../../utils/sanityClient';

interface Song {
  _id?: string;
  title: string;
  artist: string;
  id: number;
  coverArt?: File | string | null;
  music?: File | string | null;
}

const SongsManager: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const data = await sanityClient.fetch(`
        *[_type == "song"]{
          _id,
          title,
          artist,
          id,
          coverArt{
            asset->{
              url
            }
          },
          music{
            asset->{
              url
            }
          }
        }
      `, {
        timestamp: Date.now()
      }, {
        cache: 'no-store'
      });

      setSongs(data.map((song: any) => ({
        _id: song._id,
        title: song.title || '',
        artist: song.artist || '',
        id: song.id || 0,
        coverArt: song.coverArt?.asset?.url || null,
        music: song.music?.asset?.url || null
      })).sort((a: Song, b: Song) => a.id - b.id));
    } catch (error) {
      console.error('Error fetching songs:', error);
      setMessage({ type: 'error', text: 'Failed to load songs' });
    }
    setLoading(false);
  };

  const handleAddSong = () => {
    // Get next ID
    const nextId = songs.length > 0 ? Math.max(...songs.map(s => s.id)) + 1 : 1;
    
    setEditingSong({
      title: '',
      artist: '',
      id: nextId,
      coverArt: null,
      music: null
    });
    setIsDialogOpen(true);
  };

  const handleEditSong = (song: Song) => {
    setEditingSong({ ...song });
    setIsDialogOpen(true);
  };

  const handleDeleteSong = (song: Song) => {
    setSongToDelete(song);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSong = async () => {
    if (!songToDelete?._id) return;

    try {
      await sanityClient.delete(songToDelete._id);
      setMessage({ type: 'success', text: 'Song deleted successfully!' });
      setIsDeleteDialogOpen(false);
      setSongToDelete(null);
      fetchSongs();
    } catch (error) {
      console.error('Error deleting song:', error);
      setMessage({ type: 'error', text: 'Failed to delete song' });
    }
  };

  const uploadAsset = async (file: File, type: 'image' | 'file' = 'image'): Promise<string> => {
    const asset = await sanityClient.assets.upload(type, file, {
      filename: file.name
    });
    return asset._id;
  };

  const handleSaveSong = async (songData: Song) => {
    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const updateData: any = {
        title: songData.title,
        artist: songData.artist,
        id: songData.id
      };

      let progress = 0;
      const totalSteps = 2; // Cover art + music file

      // Upload cover art if it's a file
      if (songData.coverArt instanceof File) {
        const assetId = await uploadAsset(songData.coverArt, 'image');
        updateData.coverArt = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: assetId
          }
        };
        progress += 1;
        setUploadProgress((progress / totalSteps) * 100);
      }

      // Upload music file if it's a file
      if (songData.music instanceof File) {
        const assetId = await uploadAsset(songData.music, 'file');
        updateData.music = {
          _type: 'file',
          asset: {
            _type: 'reference',
            _ref: assetId
          }
        };
        progress += 1;
        setUploadProgress((progress / totalSteps) * 100);
      }

      // Save to Sanity
      if (songData._id) {
        await sanityClient.patch(songData._id).set(updateData).commit();
        setMessage({ type: 'success', text: 'Song updated successfully!' });
      } else {
        await sanityClient.create({
          _type: 'song',
          ...updateData
        });
        setMessage({ type: 'success', text: 'Song added successfully!' });
      }

      setUploadProgress(100);
      setIsDialogOpen(false);
      setEditingSong(null);
      
      // Refresh data
      setTimeout(() => {
        fetchSongs();
      }, 1000);

    } catch (error) {
      console.error('Error saving song:', error);
      setMessage({ type: 'error', text: 'Failed to save song' });
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading songs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Button onClick={handleAddSong} className="bg-red-500 hover:bg-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Song
        </Button>
      </div>

      {/* Messages */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Songs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map((song) => (
          <Card key={song._id} className="bg-gray-700 border-gray-600">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{song.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {song.artist}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditSong(song)}
                    className="border-gray-500 text-gray-300 hover:bg-gray-600"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteSong(song)}
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {typeof song.coverArt === 'string' && song.coverArt && (
                  <div className="w-16 h-16 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={song.coverArt} 
                      alt={song.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      ID: {song.id}
                    </Badge>
                    {typeof song.music === 'string' && song.music && (
                      <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                        <Play className="w-3 h-3 mr-1" />
                        Audio
                      </Badge>
                    )}
                  </div>
                  {typeof song.music === 'string' && song.music && (
                    <audio 
                      controls 
                      className="w-full h-8"
                      style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                    >
                      <source src={song.music} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {songs.length === 0 && !loading && (
        <div className="text-center py-12">
          <Music className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No songs found</h3>
          <p className="text-gray-500 mb-4">Start by adding your first music track</p>
          <Button onClick={handleAddSong} className="bg-red-500 hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Song
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSong?._id ? 'Edit Song' : 'Add New Song'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingSong?._id ? 'Update song information and files' : 'Add a new song to your music library'}
            </DialogDescription>
          </DialogHeader>
          
          {editingSong && (
            <SongForm 
              song={editingSong}
              onSave={handleSaveSong}
              onCancel={() => setIsDialogOpen(false)}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Song</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete "{songToDelete?.title}" by {songToDelete?.artist}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSongToDelete(null);
              }}
              className="border-gray-500 text-gray-300 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={confirmDeleteSong}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Song Form Component
interface SongFormProps {
  song: Song;
  onSave: (song: Song) => void;
  onCancel: () => void;
  uploading: boolean;
  uploadProgress: number;
}

const SongForm: React.FC<SongFormProps> = ({ song, onSave, onCancel, uploading, uploadProgress }) => {
  const [formData, setFormData] = useState<Song>(song);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleFileChange = (field: 'coverArt' | 'music', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Song Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="bg-gray-700 border-gray-600"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="artist">Artist *</Label>
          <Input
            id="artist"
            value={formData.artist}
            onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
            className="bg-gray-700 border-gray-600"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="id">Song ID *</Label>
        <Input
          id="id"
          type="number"
          value={formData.id}
          onChange={(e) => setFormData(prev => ({ ...prev, id: parseInt(e.target.value) || 0 }))}
          className="bg-gray-700 border-gray-600"
          required
        />
        <p className="text-xs text-gray-400">Used for ordering songs in the playlist</p>
      </div>

      {/* File Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cover Art */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-sm">Cover Art</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {typeof formData.coverArt === 'string' && formData.coverArt && (
              <div className="aspect-square bg-gray-600 rounded-lg overflow-hidden">
                <img 
                  src={formData.coverArt} 
                  alt="Current cover" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('coverArt', e.target.files?.[0] || null)}
              className="bg-gray-600 border-gray-500"
            />
          </CardContent>
        </Card>

        {/* Music File */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-sm">Audio File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {typeof formData.music === 'string' && formData.music && (
              <div className="bg-gray-600 rounded-lg p-4">
                <audio 
                  controls 
                  className="w-full"
                  style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                >
                  <source src={formData.music} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            <Input
              type="file"
              accept="audio/*"
              onChange={(e) => handleFileChange('music', e.target.files?.[0] || null)}
              className="bg-gray-600 border-gray-500"
            />
            {formData.music instanceof File && (
              <div className="text-sm text-gray-400">
                <p>Selected: {formData.music.name}</p>
                <p>Size: {(formData.music.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="bg-gray-700" />
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-red-500 hover:bg-red-600" disabled={uploading}>
          {uploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-pulse" />
              Uploading...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Song
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default SongsManager;