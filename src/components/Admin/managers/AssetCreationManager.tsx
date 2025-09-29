import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Progress } from '../../ui/progress';
import { Plus, Edit, Trash2, RefreshCw, Image as ImageIcon, Upload, Save, Video } from 'lucide-react';
import { sanityClient } from '../../../utils/sanityClient';

interface AssetCreationPhoto {
  _id?: string;
  title: string;
  subtitle: string;
  assetImage?: File | string | null;
}

interface AssetCreationVideo {
  _id?: string;
  title: string;
  subtitle: string;
  assetVideo?: File | string | null;
}

const AssetCreationManager: React.FC = () => {
  const [photos, setPhotos] = useState<AssetCreationPhoto[]>([]);
  const [videos, setVideos] = useState<AssetCreationVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<AssetCreationPhoto | AssetCreationVideo | null>(null);
  const [editingType, setEditingType] = useState<'photo' | 'video'>('photo');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [photosData, videosData] = await Promise.all([
        sanityClient.fetch(`
          *[_type == "assetCreationPhotos"]{
            _id,
            title,
            subtitle,
            assetImage{
              asset->{
                url
              }
            }
          }
        `, {
          timestamp: Date.now()
        }, {
          cache: 'no-store'
        }),
        sanityClient.fetch(`
          *[_type == "assetCreationVideos"]{
            _id,
            title,
            subtitle,
            assetVideo{
              asset->{
                url
              }
            }
          }
        `, {
          timestamp: Date.now()
        }, {
          cache: 'no-store'
        })
      ]);

      setPhotos(photosData.map((photo: any) => ({
        _id: photo._id,
        title: photo.title || '',
        subtitle: photo.subtitle || '',
        assetImage: photo.assetImage?.asset?.url || null
      })));

      setVideos(videosData.map((video: any) => ({
        _id: video._id,
        title: video.title || '',
        subtitle: video.subtitle || '',
        assetVideo: video.assetVideo?.asset?.url || null
      })));
    } catch (error) {
      console.error('Error fetching asset creation data:', error);
      setMessage({ type: 'error', text: 'Failed to load asset creation data' });
    }
    setLoading(false);
  };

  const handleAdd = (type: 'photo' | 'video') => {
    if (type === 'photo') {
      setEditingItem({ title: '', subtitle: '', assetImage: null });
    } else {
      setEditingItem({ title: '', subtitle: '', assetVideo: null });
    }
    setEditingType(type);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: AssetCreationPhoto | AssetCreationVideo, type: 'photo' | 'video') => {
    setEditingItem({ ...item });
    setEditingType(type);
    setIsDialogOpen(true);
  };

  const handleDelete = async (itemId: string, type: 'photo' | 'video') => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      await sanityClient.delete(itemId);
      setMessage({ type: 'success', text: `${type} deleted successfully!` });
      fetchData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      setMessage({ type: 'error', text: `Failed to delete ${type}` });
    }
  };

  const uploadAsset = async (file: File, type: 'image' | 'file' = 'image'): Promise<string> => {
    const asset = await sanityClient.assets.upload(type, file, {
      filename: file.name
    });
    return asset._id;
  };

  const handleSave = async (itemData: AssetCreationPhoto | AssetCreationVideo) => {
    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const updateData: any = {
        title: itemData.title,
        subtitle: itemData.subtitle
      };

      if (editingType === 'photo') {
        const photoData = itemData as AssetCreationPhoto;
        if (photoData.assetImage instanceof File) {
          setUploadProgress(50);
          const assetId = await uploadAsset(photoData.assetImage, 'image');
          updateData.assetImage = {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: assetId
            }
          };
        }
      } else {
        const videoData = itemData as AssetCreationVideo;
        if (videoData.assetVideo instanceof File) {
          setUploadProgress(50);
          const assetId = await uploadAsset(videoData.assetVideo, 'file');
          updateData.assetVideo = {
            _type: 'file',
            asset: {
              _type: 'reference',
              _ref: assetId
            }
          };
        }
      }

      setUploadProgress(90);

      const contentType = editingType === 'photo' ? 'assetCreationPhotos' : 'assetCreationVideos';

      if (itemData._id) {
        await sanityClient.patch(itemData._id).set(updateData).commit();
        setMessage({ type: 'success', text: `${editingType} updated successfully!` });
      } else {
        await sanityClient.create({
          _type: contentType,
          ...updateData
        });
        setMessage({ type: 'success', text: `${editingType} added successfully!` });
      }

      setUploadProgress(100);
      setIsDialogOpen(false);
      setEditingItem(null);
      
      setTimeout(() => {
        fetchData();
      }, 1000);

    } catch (error) {
      console.error(`Error saving ${editingType}:`, error);
      setMessage({ type: 'error', text: `Failed to save ${editingType}` });
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading asset creation content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="photos" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="photos" className="data-[state=active]:bg-red-500">Photos</TabsTrigger>
          <TabsTrigger value="videos" className="data-[state=active]:bg-red-500">Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Asset Creation Photos</h3>
            <Button onClick={() => handleAdd('photo')} className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <Card key={photo._id} className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">{photo.title}</CardTitle>
                      <CardDescription className="text-gray-400">{photo.subtitle}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(photo, 'photo')} className="border-gray-500 text-gray-300 hover:bg-gray-600">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => photo._id && handleDelete(photo._id, 'photo')} className="border-red-500 text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {typeof photo.assetImage === 'string' && photo.assetImage && (
                    <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden">
                      <img src={photo.assetImage} alt={photo.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {photos.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No photos found</h3>
              <p className="text-gray-500 mb-4">Start by adding your first asset creation photo</p>
              <Button onClick={() => handleAdd('photo')} className="bg-red-500 hover:bg-red-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Photo
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Asset Creation Videos</h3>
            <Button onClick={() => handleAdd('video')} className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video._id} className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">{video.title}</CardTitle>
                      <CardDescription className="text-gray-400">{video.subtitle}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(video, 'video')} className="border-gray-500 text-gray-300 hover:bg-gray-600">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => video._id && handleDelete(video._id, 'video')} className="border-red-500 text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {typeof video.assetVideo === 'string' && video.assetVideo && (
                    <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden">
                      <video src={video.assetVideo} controls className="w-full h-full object-cover" preload="metadata">
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {videos.length === 0 && (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No videos found</h3>
              <p className="text-gray-500 mb-4">Start by adding your first asset creation video</p>
              <Button onClick={() => handleAdd('video')} className="bg-red-500 hover:bg-red-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Video
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem?._id ? `Edit ${editingType}` : `Add New ${editingType}`}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingItem?._id ? `Update ${editingType} information` : `Add a new ${editingType} to asset creation`}
            </DialogDescription>
          </DialogHeader>
          
          {editingItem && (
            <AssetCreationForm 
              item={editingItem}
              type={editingType}
              onSave={handleSave}
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

interface AssetCreationFormProps {
  item: AssetCreationPhoto | AssetCreationVideo;
  type: 'photo' | 'video';
  onSave: (item: AssetCreationPhoto | AssetCreationVideo) => void;
  onCancel: () => void;
  uploading: boolean;
  uploadProgress: number;
}

const AssetCreationForm: React.FC<AssetCreationFormProps> = ({ item, type, onSave, onCancel, uploading, uploadProgress }) => {
  const [formData, setFormData] = useState<AssetCreationPhoto | AssetCreationVideo>(item);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleFileChange = (file: File | null) => {
    if (type === 'photo') {
      setFormData(prev => ({ ...prev, assetImage: file }));
    } else {
      setFormData(prev => ({ ...prev, assetVideo: file }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} className="bg-gray-700 border-gray-600" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input id="subtitle" value={formData.subtitle} onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))} className="bg-gray-700 border-gray-600" />
        </div>
      </div>

      <Card className="bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white text-sm">{type === 'photo' ? 'Image' : 'Video'} File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {type === 'photo' ? (
            <>
              {typeof (formData as AssetCreationPhoto).assetImage === 'string' && (formData as AssetCreationPhoto).assetImage && (
                <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden">
                  <img src={(formData as AssetCreationPhoto).assetImage as string} alt="Current" className="w-full h-full object-cover" />
                </div>
              )}
              <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} className="bg-gray-600 border-gray-500" />
            </>
          ) : (
            <>
              {typeof (formData as AssetCreationVideo).assetVideo === 'string' && (formData as AssetCreationVideo).assetVideo && (
                <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden">
                  <video src={(formData as AssetCreationVideo).assetVideo as string} controls className="w-full h-full object-cover" preload="metadata">
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              <Input type="file" accept="video/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} className="bg-gray-600 border-gray-500" />
            </>
          )}
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
          {uploading ? <><Upload className="w-4 h-4 mr-2 animate-pulse" />Uploading...</> : <><Save className="w-4 h-4 mr-2" />Save {type}</>}
        </Button>
      </div>
    </form>
  );
};

export default AssetCreationManager;
