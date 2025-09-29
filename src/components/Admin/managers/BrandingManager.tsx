import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Progress } from '../../ui/progress';
import { Plus, Edit, Trash2, RefreshCw, Video as VideoIcon, Upload, Save, Play } from 'lucide-react';
import { sanityClient } from '../../../utils/sanityClient';

interface BrandingItem {
  _id?: string;
  title: string;
  link?: string;
  videos?: Array<File | string>;
}

const BrandingManager: React.FC = () => {
  const [items, setItems] = useState<BrandingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<BrandingItem | null>(null);
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
        *[_type == "brandingPage"]{
          _id,
          title,
          videos[]{
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

      setItems(data.map((item: any) => ({
        _id: item._id,
        title: item.title || '',
        link: item.link || '',
        videos: item.videos?.map((v: any) => v.asset?.url) || []
      })));
    } catch (error) {
      console.error('Error fetching branding items:', error);
      setMessage({ type: 'error', text: 'Failed to load branding items' });
    }
    setLoading(false);
  };

  const handleAddItem = () => {
    setEditingItem({
      title: '',
      link: '',
      videos: []
    });
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: BrandingItem) => {
    setEditingItem({ ...item });
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this branding item?')) return;

    try {
      await sanityClient.delete(itemId);
      setMessage({ type: 'success', text: 'Branding item deleted successfully!' });
      fetchItems();
    } catch (error) {
      console.error('Error deleting branding item:', error);
      setMessage({ type: 'error', text: 'Failed to delete branding item' });
    }
  };

  const uploadAsset = async (file: File): Promise<string> => {
    const asset = await sanityClient.assets.upload('file', file, {
      filename: file.name
    });
    return asset._id;
  };

  const uploadMultipleAssets = async (files: File[]): Promise<string[]> => {
    const assetIds: string[] = [];
    for (const file of files) {
      const assetId = await uploadAsset(file);
      assetIds.push(assetId);
    }
    return assetIds;
  };

  const handleSaveItem = async (itemData: BrandingItem) => {
    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const updateData: any = {
        title: itemData.title,
        link: itemData.link
      };

      // Upload videos if they are files
      if (itemData.videos && itemData.videos.some(v => v instanceof File)) {
        const videoFiles = itemData.videos.filter(v => v instanceof File) as File[];
        if (videoFiles.length > 0) {
          setUploadProgress(25);
          const assetIds = await uploadMultipleAssets(videoFiles);
          setUploadProgress(75);
          
          updateData.videos = assetIds.map(id => ({
            _type: 'file',
            asset: {
              _type: 'reference',
              _ref: id
            }
          }));
        }
      }

      setUploadProgress(90);

      // Save to Sanity
      if (itemData._id) {
        await sanityClient.patch(itemData._id).set(updateData).commit();
        setMessage({ type: 'success', text: 'Branding item updated successfully!' });
      } else {
        await sanityClient.create({
          _type: 'brandingPage',
          ...updateData
        });
        setMessage({ type: 'success', text: 'Branding item added successfully!' });
      }

      setUploadProgress(100);
      setIsDialogOpen(false);
      setEditingItem(null);
      
      setTimeout(() => {
        fetchItems();
      }, 1000);

    } catch (error) {
      console.error('Error saving branding item:', error);
      setMessage({ type: 'error', text: 'Failed to save branding item' });
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading branding items...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <VideoIcon className="w-6 h-6 text-red-500" />
          <div>
            <h2 className="text-xl font-bold text-white">Branding Page</h2>
            <p className="text-gray-400">Manage branding page videos and content</p>
          </div>
        </div>
        <Button onClick={handleAddItem} className="bg-red-500 hover:bg-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Branding Item
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item._id} className="bg-gray-700 border-gray-600">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {item.videos && item.videos.length > 0 ? `${item.videos.length} video(s)` : 'No videos'}
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
            <CardContent className="space-y-4">
              {item.videos && item.videos.length > 0 && typeof item.videos[0] === 'string' && (
                <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden">
                  <video 
                    src={item.videos[0] as string} 
                    controls
                    className="w-full h-full object-cover"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              
              <div className="flex flex-wrap gap-1">
                {item.videos && item.videos.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Play className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">{item.videos.length} video(s)</span>
                  </div>
                )}
                {item.link && (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:text-blue-300 text-xs truncate block mt-2"
                  >
                    {item.link}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-12">
          <VideoIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No branding items found</h3>
          <p className="text-gray-500 mb-4">Start by adding your first branding item</p>
          <Button onClick={handleAddItem} className="bg-red-500 hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Branding Item
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem?._id ? 'Edit Branding Item' : 'Add New Branding Item'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingItem?._id ? 'Update branding item information' : 'Add a new branding item with videos'}
            </DialogDescription>
          </DialogHeader>
          
          {editingItem && (
            <BrandingForm 
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

interface BrandingFormProps {
  item: BrandingItem;
  onSave: (item: BrandingItem) => void;
  onCancel: () => void;
  uploading: boolean;
  uploadProgress: number;
}

const BrandingForm: React.FC<BrandingFormProps> = ({ item, onSave, onCancel, uploading, uploadProgress }) => {
  const [formData, setFormData] = useState<BrandingItem>(item);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setFormData(prev => ({ ...prev, videos: fileArray }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="bg-gray-700 border-gray-600"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="link">Link (Optional)</Label>
          <Input
            id="link"
            value={formData.link}
            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
            className="bg-gray-700 border-gray-600"
            placeholder="https://..."
          />
        </div>
      </div>

      <Card className="bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white text-sm">Videos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.videos && formData.videos.length > 0 && typeof formData.videos[0] === 'string' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.videos.slice(0, 4).map((video, index) => (
                <div key={index} className="aspect-video bg-gray-600 rounded-lg overflow-hidden">
                  <video 
                    src={video as string} 
                    controls
                    className="w-full h-full object-cover"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ))}
            </div>
          )}
          
          <Input
            type="file"
            accept="video/*"
            multiple
            onChange={(e) => handleFileChange(e.target.files)}
            className="bg-gray-600 border-gray-500"
          />
          
          {formData.videos && formData.videos.some(v => v instanceof File) && (
            <div className="text-sm text-gray-400">
              <p>Selected: {formData.videos.filter(v => v instanceof File).length} video(s)</p>
              <p>Total size: {(formData.videos.filter(v => v instanceof File).reduce((acc, file) => acc + (file as File).size, 0) / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
          
          {formData.videos && formData.videos.length > 0 && typeof formData.videos[0] === 'string' && (
            <p className="text-xs text-gray-400">
              Current: {formData.videos.length} video(s)
            </p>
          )}
        </CardContent>
      </Card>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Uploading videos...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="bg-gray-700" />
        </div>
      )}

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
              Save Branding Item
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default BrandingManager;
