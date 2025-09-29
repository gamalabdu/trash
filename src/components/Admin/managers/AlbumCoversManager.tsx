import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Progress } from '../../ui/progress';
import { Plus, Edit, Trash2, RefreshCw, Image as ImageIcon, Upload, Save } from 'lucide-react';
import { sanityClient } from '../../../utils/sanityClient';

interface AlbumCover {
  _id?: string;
  title: string;
  artist: string;
  image?: File | string | null;
  link: string;
}

const AlbumCoversManager: React.FC = () => {
  const [covers, setCovers] = useState<AlbumCover[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCover, setEditingCover] = useState<AlbumCover | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [coverToDelete, setCoverToDelete] = useState<AlbumCover | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCovers();
  }, []);

  const fetchCovers = async () => {
    setLoading(true);
    try {
      const data = await sanityClient.fetch(`
        *[_type == "productionPageAlbums"]{
          _id,
          title,
          artist,
          coverArt{
            asset->{
              url
            }
          },
          link
        }
      `, {
        timestamp: Date.now()
      }, {
        cache: 'no-store'
      });

      setCovers(data.map((cover: any) => ({
        _id: cover._id,
        title: cover.title || '',
        artist: cover.artist || '',
        image: cover.coverArt?.asset?.url || null,
        link: cover.link || ''
      })));
    } catch (error) {
      console.error('Error fetching album covers:', error);
      setMessage({ type: 'error', text: 'Failed to load album covers' });
    }
    setLoading(false);
  };

  const handleAddCover = () => {
    setEditingCover({
      title: '',
      artist: '',
      image: null,
      link: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditCover = (cover: AlbumCover) => {
    setEditingCover({ ...cover });
    setIsDialogOpen(true);
  };

  const handleDeleteCover = (cover: AlbumCover) => {
    setCoverToDelete(cover);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCover = async () => {
    if (!coverToDelete?._id) return;

    try {
      await sanityClient.delete(coverToDelete._id);
      setMessage({ type: 'success', text: 'Album cover deleted successfully!' });
      setIsDeleteDialogOpen(false);
      setCoverToDelete(null);
      fetchCovers();
    } catch (error) {
      console.error('Error deleting album cover:', error);
      setMessage({ type: 'error', text: 'Failed to delete album cover' });
    }
  };

  const uploadAsset = async (file: File): Promise<string> => {
    const asset = await sanityClient.assets.upload('image', file, {
      filename: file.name
    });
    return asset._id;
  };

  const handleSaveCover = async (coverData: AlbumCover) => {
    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const updateData: any = {
        title: coverData.title,
        artist: coverData.artist,
        link: coverData.link
      };

      // Upload image if it's a file
      if (coverData.image instanceof File) {
        setUploadProgress(50);
        const assetId = await uploadAsset(coverData.image);
        updateData.coverArt = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: assetId
          }
        };
      }

      setUploadProgress(90);

      // Save to Sanity
      if (coverData._id) {
        await sanityClient.patch(coverData._id).set(updateData).commit();
        setMessage({ type: 'success', text: 'Album cover updated successfully!' });
      } else {
        await sanityClient.create({
          _type: 'productionPageAlbums',
          ...updateData
        });
        setMessage({ type: 'success', text: 'Album cover added successfully!' });
      }

      setUploadProgress(100);
      setIsDialogOpen(false);
      setEditingCover(null);
      
      // Small delay to ensure Sanity has processed the update, then refresh
      setTimeout(async () => {
        await fetchCovers();
      }, 500);

    } catch (error) {
      console.error('Error saving album cover:', error);
      setMessage({ type: 'error', text: 'Failed to save album cover' });
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading album covers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div className="flex space-x-2">
          <Button onClick={fetchCovers} variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAddCover} className="bg-red-500 hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Album Cover
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {covers.map((cover) => (
          <Card key={cover._id} className="bg-gray-700 border-gray-600">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{cover.title}</CardTitle>
                  <CardDescription className="text-gray-400">{cover.artist}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditCover(cover)} className="border-gray-500 text-gray-300 hover:bg-gray-600">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteCover(cover)} className="border-red-500 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {typeof cover.image === 'string' && cover.image && (
                <div className="aspect-square bg-gray-600 rounded-lg overflow-hidden mb-4">
                  <img src={cover.image} alt={cover.title} className="w-full h-full object-cover" />
                </div>
              )}
              {cover.link && (
                <a href={cover.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm truncate block">
                  {cover.link}
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {covers.length === 0 && !loading && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No album covers found</h3>
          <p className="text-gray-500 mb-4">Start by adding your first album cover</p>
          <Button onClick={handleAddCover} className="bg-red-500 hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Album Cover
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCover?._id ? 'Edit Album Cover' : 'Add New Album Cover'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingCover?._id ? 'Update album cover information' : 'Add a new album cover to your collection'}
            </DialogDescription>
          </DialogHeader>
          
          {editingCover && (
            <AlbumCoverForm 
              cover={editingCover}
              onSave={handleSaveCover}
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
            <DialogTitle>Delete Album Cover</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete "{coverToDelete?.title}" by {coverToDelete?.artist}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCoverToDelete(null);
              }}
              className="border-gray-500 text-gray-300 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={confirmDeleteCover}
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

interface AlbumCoverFormProps {
  cover: AlbumCover;
  onSave: (cover: AlbumCover) => void;
  onCancel: () => void;
  uploading: boolean;
  uploadProgress: number;
}

const AlbumCoverForm: React.FC<AlbumCoverFormProps> = ({ cover, onSave, onCancel, uploading, uploadProgress }) => {
  const [formData, setFormData] = useState<AlbumCover>(cover);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Album Title *</Label>
          <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} className="bg-gray-700 border-gray-600" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="artist">Artist *</Label>
          <Input id="artist" value={formData.artist} onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))} className="bg-gray-700 border-gray-600" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Link</Label>
        <Input id="link" value={formData.link} onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))} className="bg-gray-700 border-gray-600" placeholder="https://..." />
      </div>

      <Card className="bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white text-sm">Album Cover Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {typeof formData.image === 'string' && formData.image && (
            <div className="aspect-square bg-gray-600 rounded-lg overflow-hidden max-w-xs">
              <img src={formData.image} alt="Current cover" className="w-full h-full object-cover" />
            </div>
          )}
          <Input type="file" accept="image/*" onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }))} className="bg-gray-600 border-gray-500" />
        </CardContent>
      </Card>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="bg-gray-700" />
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>Cancel</Button>
        <Button type="submit" className="bg-red-500 hover:bg-red-600" disabled={uploading}>
          {uploading ? <><Upload className="w-4 h-4 mr-2 animate-pulse" />Uploading...</> : <><Save className="w-4 h-4 mr-2" />Save Album Cover</>}
        </Button>
      </div>
    </form>
  );
};

export default AlbumCoversManager;
