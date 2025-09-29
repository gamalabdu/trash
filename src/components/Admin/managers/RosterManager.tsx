import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Plus, Edit, Trash2, RefreshCw, Users } from 'lucide-react';
import { sanityClient } from '../../../utils/sanityClient';

interface RosterArtist {
  _id?: string;
  artistName: string;
  artistBio: string;
  artistImage: File | string | null;
  artistSocials: Array<{
    link: string;
    type: string;
  }>;
}

const RosterManager: React.FC = () => {
  const [artists, setArtists] = useState<RosterArtist[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingArtist, setEditingArtist] = useState<RosterArtist | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [artistToDelete, setArtistToDelete] = useState<RosterArtist | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const data = await sanityClient.fetch(`
        *[_type == "roster"]{
          _id,
          artistName,
          artistBio,
          artistSocials[]{
            link,
            type
          },
          artistImage{
            asset -> {
              url
            }
          }
        }
      `, {
        timestamp: Date.now()
      }, {
        cache: 'no-store'
      });

      setArtists(data.map((artist: any) => ({
        _id: artist._id,
        artistName: artist.artistName || '',
        artistBio: artist.artistBio || '',
        artistImage: artist.artistImage?.asset?.url || null,
        artistSocials: artist.artistSocials || []
      })));
    } catch (error) {
      console.error('Error fetching artists:', error);
      setMessage({ type: 'error', text: 'Failed to load artists' });
    }
    setLoading(false);
  };

  const handleAddArtist = () => {
    setEditingArtist({
      artistName: '',
      artistBio: '',
      artistImage: null,
      artistSocials: []
    });
    setIsDialogOpen(true);
  };

  const handleEditArtist = (artist: RosterArtist) => {
    setEditingArtist(artist);
    setIsDialogOpen(true);
  };

  const handleDeleteArtist = (artist: RosterArtist) => {
    setArtistToDelete(artist);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteArtist = async () => {
    if (!artistToDelete?._id) return;

    try {
      await sanityClient.delete(artistToDelete._id);
      setMessage({ type: 'success', text: 'Artist deleted successfully!' });
      setIsDeleteDialogOpen(false);
      setArtistToDelete(null);
      fetchArtists();
    } catch (error) {
      console.error('Error deleting artist:', error);
      setMessage({ type: 'error', text: 'Failed to delete artist' });
    }
  };

  const uploadAsset = async (file: File): Promise<string> => {
    const asset = await sanityClient.assets.upload('image', file, {
      filename: file.name
    });
    return asset._id;
  };

  const handleSaveArtist = async (artistData: RosterArtist) => {
    setMessage(null);
    
    try {
      const updateData: any = {
        artistName: artistData.artistName,
        artistBio: artistData.artistBio,
        artistSocials: artistData.artistSocials
      };

      // Upload image if it's a file
      if (artistData.artistImage instanceof File) {
        const assetId = await uploadAsset(artistData.artistImage);
        updateData.artistImage = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: assetId
          }
        };
      }

      if (artistData._id) {
        await sanityClient.patch(artistData._id).set(updateData).commit();
        setMessage({ type: 'success', text: 'Artist updated successfully!' });
      } else {
        await sanityClient.create({
          _type: 'roster',
          ...updateData
        });
        setMessage({ type: 'success', text: 'Artist added successfully!' });
      }

      setIsDialogOpen(false);
      setEditingArtist(null);
      
      // Refresh data
      setTimeout(() => {
        fetchArtists();
      }, 1000);
      
    } catch (error) {
      console.error('Error saving artist:', error);
      setMessage({ type: 'error', text: 'Failed to save artist' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading artists...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Button onClick={handleAddArtist} className="bg-red-500 hover:bg-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Artist
        </Button>
      </div>

      {/* Messages */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <Card key={artist._id} className="bg-gray-700 border-gray-600">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{artist.artistName}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {artist.artistSocials.length} social links
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditArtist(artist)}
                    className="border-gray-500 text-gray-300 hover:bg-gray-600"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteArtist(artist)}
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {typeof artist.artistImage === 'string' && artist.artistImage && (
                <div className="aspect-square bg-gray-600 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={artist.artistImage} 
                    alt={artist.artistName} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-gray-300 text-sm mb-3 line-clamp-3">{artist.artistBio}</p>
              <div className="flex flex-wrap gap-1">
                {artist.artistSocials.map((social, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {social.type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingArtist?._id ? 'Edit Artist' : 'Add New Artist'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingArtist?._id ? 'Update artist information' : 'Add a new artist to the roster'}
            </DialogDescription>
          </DialogHeader>
          
          {editingArtist && (
            <ArtistForm 
              artist={editingArtist}
              onSave={handleSaveArtist}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Artist</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete "{artistToDelete?.artistName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setArtistToDelete(null);
              }}
              className="border-gray-500 text-gray-300 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={confirmDeleteArtist}
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

// Artist Form Component
interface ArtistFormProps {
  artist: RosterArtist;
  onSave: (artist: RosterArtist) => void;
  onCancel: () => void;
}

const ArtistForm: React.FC<ArtistFormProps> = ({ artist, onSave, onCancel }) => {
  const [formData, setFormData] = useState<RosterArtist>(artist);
  const [newSocial, setNewSocial] = useState({ link: '', type: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addSocial = () => {
    if (newSocial.link && newSocial.type) {
      setFormData(prev => ({
        ...prev,
        artistSocials: [...prev.artistSocials, newSocial]
      }));
      setNewSocial({ link: '', type: '' });
    }
  };

  const removeSocial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      artistSocials: prev.artistSocials.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="artistName">Artist Name</Label>
        <Input
          id="artistName"
          value={formData.artistName}
          onChange={(e) => setFormData(prev => ({ ...prev, artistName: e.target.value }))}
          className="bg-gray-700 border-gray-600"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="artistBio">Artist Bio</Label>
        <Textarea
          id="artistBio"
          value={formData.artistBio}
          onChange={(e) => setFormData(prev => ({ ...prev, artistBio: e.target.value }))}
          className="bg-gray-700 border-gray-600"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="artistImage">Artist Image</Label>
        <Input
          id="artistImage"
          type="file"
          accept="image/*"
          onChange={(e) => setFormData(prev => ({ ...prev, artistImage: e.target.files?.[0] || null }))}
          className="bg-gray-700 border-gray-600"
        />
      </div>

      {/* Social Links */}
      <div className="space-y-2">
        <Label>Social Links</Label>
        <div className="space-y-2">
          {formData.artistSocials.map((social, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Badge variant="secondary">{social.type}</Badge>
              <span className="text-sm text-gray-300 flex-1">{social.link}</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => removeSocial(index)}
                className="border-red-500 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Input
            placeholder="Social platform (e.g., Instagram)"
            value={newSocial.type}
            onChange={(e) => setNewSocial(prev => ({ ...prev, type: e.target.value }))}
            className="bg-gray-700 border-gray-600"
          />
          <Input
            placeholder="Social link URL"
            value={newSocial.link}
            onChange={(e) => setNewSocial(prev => ({ ...prev, link: e.target.value }))}
            className="bg-gray-700 border-gray-600"
          />
          <Button type="button" onClick={addSocial} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-red-500 hover:bg-red-600">
          Save Artist
        </Button>
      </div>
    </form>
  );
};

export default RosterManager;
