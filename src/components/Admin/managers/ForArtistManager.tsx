import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Plus, Edit, Trash2, RefreshCw, FileText, Upload, Save, Play } from 'lucide-react';
import { sanityClient } from '../../../utils/sanityClient';

interface ForArtistItem {
  _id?: string;
  name: string;
  forArtistThumbnail?: File | string | null;
  forArtistVideo?: File | string | null;
}

const ForArtistManager: React.FC = () => {
  const [items, setItems] = useState<ForArtistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<ForArtistItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await sanityClient.fetch(`
        *[_type == "forartist"]{
          _id,
          name,
          forArtistThumbnail{
            asset->{
              url
            }
          },
          forArtistVideo{
            asset-> {
              url
            }
          }
        }
      `, {
        timestamp: Date.now()
      }, {
        cache: 'no-store'
      });

      setItems(data.map((item: any) => ({
        _id: item._id,
        name: item.name || '',
        forArtistThumbnail: item.forArtistThumbnail?.asset?.url || null,
        forArtistVideo: item.forArtistVideo?.asset?.url || null
      })));
    } catch (error) {
      console.error('Error fetching for artist items:', error);
      setMessage({ type: 'error', text: 'Failed to load for artist items' });
    }
    setLoading(false);
  };

  const handleAddItem = () => {
    setEditingItem({
      name: '',
      forArtistThumbnail: null,
      forArtistVideo: null
    });
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: ForArtistItem) => {
    setEditingItem({ ...item });
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await sanityClient.delete(itemId);
      setMessage({ type: 'success', text: 'Item deleted successfully!' });
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage({ type: 'error', text: 'Failed to delete item' });
    }
  };

  const uploadAsset = async (file: File, type: 'image' | 'file' = 'image'): Promise<string> => {
    const asset = await sanityClient.assets.upload(type, file, {
      filename: file.name
    });
    return asset._id;
  };

  const handleSaveItem = async (itemData: ForArtistItem) => {
    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const updateData: any = {
        name: itemData.name
      };

      let progress = 0;
      const totalSteps = 2; // Thumbnail + video

      // Upload thumbnail if it's a file
      if (itemData.forArtistThumbnail instanceof File) {
        const assetId = await uploadAsset(itemData.forArtistThumbnail, 'image');
        updateData.forArtistThumbnail = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: assetId
          }
        };
        progress += 1;
        setUploadProgress((progress / totalSteps) * 100);
      }

      // Upload video if it's a file
      if (itemData.forArtistVideo instanceof File) {
        const assetId = await uploadAsset(itemData.forArtistVideo, 'file');
        updateData.forArtistVideo = {
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
      if (itemData._id) {
        await sanityClient.patch(itemData._id).set(updateData).commit();
        setMessage({ type: 'success', text: 'Item updated successfully!' });
      } else {
        await sanityClient.create({
          _type: 'forartist',
          ...updateData
        });
        setMessage({ type: 'success', text: 'Item added successfully!' });
      }

      setUploadProgress(100);
      setIsDialogOpen(false);
      setEditingItem(null);
      
      // Refresh data
      setTimeout(() => {
        fetchItems();
      }, 1000);

    } catch (error) {
      console.error('Error saving item:', error);
      setMessage({ type: 'error', text: 'Failed to save item' });
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading for artist items...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Button onClick={handleAddItem} className="bg-red-500 hover:bg-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Messages */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item._id} className="bg-gray-700 border-gray-600">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    For Artist Content
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditItem(item)}
                    className="border-gray-500 text-gray-300 hover:bg-gray-600"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => item._id && handleDeleteItem(item._id)}
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {typeof item.forArtistThumbnail === 'string' && item.forArtistThumbnail && (
                <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={item.forArtistThumbnail} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {item.name}
                </Badge>
                {typeof item.forArtistVideo === 'string' && item.forArtistVideo && (
                  <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                    <Play className="w-3 h-3 mr-1" />
                    Video
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No items found</h3>
          <p className="text-gray-500 mb-4">Start by adding your first for artist item</p>
          <Button onClick={handleAddItem} className="bg-red-500 hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Item
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem?._id ? 'Edit For Artist Item' : 'Add New For Artist Item'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingItem?._id ? 'Update item information and files' : 'Add a new item to the for artist page'}
            </DialogDescription>
          </DialogHeader>
          
          {editingItem && (
            <ForArtistForm 
              item={editingItem}
              onSave={handleSaveItem}
              onCancel={() => setIsDialogOpen(false)}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Form Component
interface ForArtistFormProps {
  item: ForArtistItem;
  onSave: (item: ForArtistItem) => void;
  onCancel: () => void;
  uploading: boolean;
  uploadProgress: number;
}

const ForArtistForm: React.FC<ForArtistFormProps> = ({ item, onSave, onCancel, uploading, uploadProgress }) => {
  const [formData, setFormData] = useState<ForArtistItem>(item);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleFileChange = (field: 'forArtistThumbnail' | 'forArtistVideo', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="bg-gray-700 border-gray-600"
          placeholder="e.g., Music Creation, Asset Creation"
          required
        />
      </div>

      {/* File Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thumbnail */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-sm">Thumbnail Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {typeof formData.forArtistThumbnail === 'string' && formData.forArtistThumbnail && (
              <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden">
                <img 
                  src={formData.forArtistThumbnail} 
                  alt="Current thumbnail" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('forArtistThumbnail', e.target.files?.[0] || null)}
              className="bg-gray-600 border-gray-500"
            />
          </CardContent>
        </Card>

        {/* Video */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-sm">Video File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {typeof formData.forArtistVideo === 'string' && formData.forArtistVideo && (
              <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden">
                <video 
                  src={formData.forArtistVideo} 
                  controls
                  className="w-full h-full object-cover"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange('forArtistVideo', e.target.files?.[0] || null)}
              className="bg-gray-600 border-gray-500"
            />
            {formData.forArtistVideo instanceof File && (
              <div className="text-sm text-gray-400">
                <p>Selected: {formData.forArtistVideo.name}</p>
                <p>Size: {(formData.forArtistVideo.size / 1024 / 1024).toFixed(2)} MB</p>
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
              Save Item
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ForArtistManager;
