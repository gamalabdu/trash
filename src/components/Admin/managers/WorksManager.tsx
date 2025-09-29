import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Plus, Edit, Trash2, RefreshCw, Image as ImageIcon, Upload, Save, X, Video } from 'lucide-react';
import { sanityClient } from '../../../utils/sanityClient';

interface Work {
  _id?: string;
  name: string;
  statement: string;
  type: string;
  image?: File | string | null;
  iphone?: boolean;
  videos?: Array<File | string>;
  images?: Array<File | string>;
  canvas?: Array<File | string>;
  assets?: Array<File | string>;
  artworks?: Array<File | string>;
}

const WorksManager: React.FC = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workToDelete, setWorkToDelete] = useState<Work | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    setLoading(true);
    try {
      const data = await sanityClient.fetch(`
        *[_type == "work"]{
          _id,
          name,
          statement,
          type,
          image{
            asset->{
              url
            }
          },
          iphone,
          videos[]{
            asset->{
              url
            }
          },
          images[]{
            asset-> {
              url
            }
          },
          canvas[]{
            asset-> {
              url
            }
          },
          assets[]{
            asset->{
              url
            }
          },
          artworks[]{
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

      const mappedWorks = data.map((work: any) => {
        return {
          _id: work._id,
          name: work.name || '',
          statement: work.statement || '',
          type: work.type || '',
          image: work.image?.asset?.url || null,
          iphone: work.iphone || false,
          videos: work.videos?.map((v: any) => v.asset?.url).filter(Boolean) || [],
          images: work.images?.map((i: any) => i.asset?.url).filter(Boolean) || [],
          canvas: work.canvas?.map((c: any) => c.asset?.url).filter(Boolean) || [],
          assets: work.assets?.map((a: any) => a.asset?.url).filter(Boolean) || [],
          artworks: work.artworks?.map((a: any) => a.asset?.url).filter(Boolean) || []
        };
      });
      
      setWorks(mappedWorks);
    } catch (error) {
      console.error('Error fetching works:', error);
      setMessage({ type: 'error', text: 'Failed to load works' });
    }
    setLoading(false);
  };

  const handleAddWork = () => {
    setEditingWork({
      name: '',
      statement: '',
      type: '',
      image: null,
      iphone: false,
      videos: [],
      images: [],
      canvas: [],
      assets: [],
      artworks: []
    });
    setIsDialogOpen(true);
  };

  const handleEditWork = (work: Work) => {
    setEditingWork({ ...work });
    setIsDialogOpen(true);
  };

  const handleDeleteWork = (work: Work) => {
    setWorkToDelete(work);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteWork = async () => {
    if (!workToDelete?._id) return;

    try {
      await sanityClient.delete(workToDelete._id);
      setMessage({ type: 'success', text: 'Work deleted successfully!' });
      setIsDeleteDialogOpen(false);
      setWorkToDelete(null);
      fetchWorks();
    } catch (error) {
      console.error('Error deleting work:', error);
      setMessage({ type: 'error', text: 'Failed to delete work' });
    }
  };

  const uploadAsset = async (file: File, type: 'image' | 'file' = 'image'): Promise<string> => {
    const asset = await sanityClient.assets.upload(type, file, {
      filename: file.name
    });
    return asset._id;
  };

  const uploadMultipleAssets = async (files: File[], type: 'image' | 'file' = 'image'): Promise<string[]> => {
    const assetIds: string[] = [];
    for (const file of files) {
      const assetId = await uploadAsset(file, type);
      assetIds.push(assetId);
    }
    return assetIds;
  };

  const handleSaveWork = async (workData: Work) => {
    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const updateData: any = {
        name: workData.name,
        statement: workData.statement,
        type: workData.type,
        iphone: workData.iphone
      };

      let progress = 0;
      const totalSteps = 6; // Main image + 5 arrays

      // Upload main image if it's a file
      if (workData.image instanceof File) {
        const assetId = await uploadAsset(workData.image);
        updateData.image = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: assetId
          }
        };
        progress += 1;
        setUploadProgress((progress / totalSteps) * 100);
      }

      // Upload videos
      if (workData.videos && workData.videos.some(v => v instanceof File)) {
        const videoFiles = workData.videos.filter(v => v instanceof File) as File[];
        if (videoFiles.length > 0) {
          const assetIds = await uploadMultipleAssets(videoFiles, 'file');
          updateData.videos = assetIds.map(id => ({
            _type: 'file',
            asset: {
              _type: 'reference',
              _ref: id
            }
          }));
        }
        progress += 1;
        setUploadProgress((progress / totalSteps) * 100);
      }

      // Upload images array
      if (workData.images && workData.images.some(i => i instanceof File)) {
        const imageFiles = workData.images.filter(i => i instanceof File) as File[];
        if (imageFiles.length > 0) {
          const assetIds = await uploadMultipleAssets(imageFiles);
          updateData.images = assetIds.map(id => ({
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: id
            }
          }));
        }
        progress += 1;
        setUploadProgress((progress / totalSteps) * 100);
      }

      // Upload canvas
      if (workData.canvas && workData.canvas.some(c => c instanceof File)) {
        const canvasFiles = workData.canvas.filter(c => c instanceof File) as File[];
        if (canvasFiles.length > 0) {
          const assetIds = await uploadMultipleAssets(canvasFiles);
          updateData.canvas = assetIds.map(id => ({
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: id
            }
          }));
        }
        progress += 1;
        setUploadProgress((progress / totalSteps) * 100);
      }

      // Upload assets
      if (workData.assets && workData.assets.some(a => a instanceof File)) {
        const assetFiles = workData.assets.filter(a => a instanceof File) as File[];
        if (assetFiles.length > 0) {
          const assetIds = await uploadMultipleAssets(assetFiles, 'file');
          updateData.assets = assetIds.map(id => ({
            _type: 'file',
            asset: {
              _type: 'reference',
              _ref: id
            }
          }));
        }
        progress += 1;
        setUploadProgress((progress / totalSteps) * 100);
      }

      // Upload artworks
      if (workData.artworks && workData.artworks.some(a => a instanceof File)) {
        const artworkFiles = workData.artworks.filter(a => a instanceof File) as File[];
        if (artworkFiles.length > 0) {
          const assetIds = await uploadMultipleAssets(artworkFiles);
          updateData.artworks = assetIds.map(id => ({
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: id
            }
          }));
        }
        progress += 1;
        setUploadProgress((progress / totalSteps) * 100);
      }

      // Save to Sanity
      if (workData._id) {
        await sanityClient.patch(workData._id).set(updateData).commit();
        setMessage({ type: 'success', text: 'Work updated successfully!' });
      } else {
        await sanityClient.create({
          _type: 'work',
          ...updateData
        });
        setMessage({ type: 'success', text: 'Work added successfully!' });
      }

      setUploadProgress(100);
      setIsDialogOpen(false);
      setEditingWork(null);
      
      // Refresh data
      setTimeout(() => {
        fetchWorks();
      }, 1000);

    } catch (error) {
      console.error('Error saving work:', error);
      setMessage({ type: 'error', text: 'Failed to save work' });
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading works...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ImageIcon className="w-6 h-6 text-red-500" />
          <div>
            <h2 className="text-xl font-bold text-white">Portfolio Works</h2>
            <p className="text-gray-400">Manage your portfolio projects and works</p>
          </div>
        </div>
        <Button onClick={handleAddWork} className="bg-red-500 hover:bg-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Work
        </Button>
      </div>

      {/* Messages */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Works Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {works.map((work) => (
          <Card key={work._id} className="bg-gray-700 border-gray-600">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{work.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {work.type}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditWork(work)}
                    className="border-gray-500 text-gray-300 hover:bg-gray-600"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteWork(work)}
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {typeof work.image === 'string' && work.image && (
                <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={work.image} 
                    alt={work.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-gray-300 text-sm mb-3 line-clamp-3">{work.statement}</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {work.type}
                </Badge>
                {work.iphone && (
                  <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                    iPhone
                  </Badge>
                )}
                {work.videos && work.videos.length > 0 && (
                  <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">
                    {work.videos.length} Videos
                  </Badge>
                )}
                {work.images && work.images.length > 0 && (
                  <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                    {work.images.length} Images
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {works.length === 0 && !loading && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No works found</h3>
          <p className="text-gray-500 mb-4">Start by adding your first portfolio work</p>
          <Button onClick={handleAddWork} className="bg-red-500 hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Work
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWork?._id ? 'Edit Work' : 'Add New Work'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingWork?._id ? 'Update work information and assets' : 'Add a new work to your portfolio'}
            </DialogDescription>
          </DialogHeader>
          
          {editingWork && (
            <WorkForm 
              work={editingWork}
              onSave={handleSaveWork}
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
            <DialogTitle>Delete Work</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete "{workToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setWorkToDelete(null);
              }}
              className="border-gray-500 text-gray-300 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={confirmDeleteWork}
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

// Work Form Component
interface WorkFormProps {
  work: Work;
  onSave: (work: Work) => void;
  onCancel: () => void;
  uploading: boolean;
  uploadProgress: number;
}

const WorkForm: React.FC<WorkFormProps> = ({ work, onSave, onCancel, uploading, uploadProgress }) => {
  const [formData, setFormData] = useState<Work>(work);

  // Debug logging to see what data we have
  console.log('WorkForm - work prop:', work);
  console.log('WorkForm - videos:', work.videos);
  console.log('WorkForm - canvas:', work.canvas);
  console.log('WorkForm - images:', work.images);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleFileChange = (field: keyof Work, files: FileList | null) => {
    if (!files) return;
    
    if (field === 'image') {
      setFormData(prev => ({ ...prev, [field]: files[0] }));
    } else {
      // For array fields - append new files to existing ones
      const fileArray = Array.from(files);
      setFormData(prev => ({ 
        ...prev, 
        [field]: [...(prev[field] as (File | string)[] || []), ...fileArray] 
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Work Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="bg-gray-700 border-gray-600"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Input
            id="type"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="bg-gray-700 border-gray-600"
            placeholder="e.g., Web Design, Branding, Photography"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="statement">Statement</Label>
        <Textarea
          id="statement"
          value={formData.statement}
          onChange={(e) => setFormData(prev => ({ ...prev, statement: e.target.value }))}
          className="bg-gray-700 border-gray-600"
          rows={4}
          placeholder="Describe this work..."
        />
      </div>

      {/* iPhone Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="iphone"
          checked={formData.iphone}
          onChange={(e) => setFormData(prev => ({ ...prev, iphone: e.target.checked }))}
          className="rounded"
        />
        <Label htmlFor="iphone">iPhone Optimized</Label>
      </div>

      {/* File Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Image */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-sm">Main Image</CardTitle>
          </CardHeader>
          <CardContent>
            {typeof formData.image === 'string' && formData.image && (
              <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden mb-2">
                <img src={formData.image} alt="Current" className="w-full h-full object-cover" />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('image', e.target.files)}
              className="bg-gray-600 border-gray-500"
            />
          </CardContent>
        </Card>

        {/* Videos */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-sm">Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => handleFileChange('videos', e.target.files)}
              className="bg-gray-600 border-gray-500"
            />
            {formData.videos && formData.videos.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.videos.map((video, index) => {
                  console.log('Rendering video:', video, 'Type:', typeof video);
                  return (
                    <div key={index} className="flex items-center justify-between bg-gray-600 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        {typeof video === 'string' ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-24 h-16 bg-gray-500 rounded overflow-hidden flex-shrink-0 relative group">
                              <video 
                                src={video} 
                                className="w-full h-full object-cover"
                                muted
                                preload="metadata"
                                playsInline
                                controls
                                autoPlay
                                loop
                                onLoadedData={(e) => {
                                  console.log('Video loaded:', video);
                                  // Set to 1 second to show a frame
                                  e.currentTarget.currentTime = 1;
                                }}
                                onError={(e) => {
                                  console.error('Video error:', video, e);
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-300 block truncate">Video {index + 1}</span>
                              <span className="text-xs text-gray-400 block truncate">{video.split('/').pop()}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-500 rounded flex items-center justify-center">
                              <Video className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs text-gray-300">{video.name}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newVideos = formData.videos?.filter((_, i) => i !== index) || [];
                          setFormData(prev => ({ ...prev, videos: newVideos }));
                        }}
                        className="border-red-500 text-red-400 hover:bg-red-500/10 h-6 px-2"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-sm">Gallery Images</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange('images', e.target.files)}
              className="bg-gray-600 border-gray-500"
            />
            {formData.images && formData.images.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-600 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      {typeof image === 'string' ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-12 bg-gray-500 rounded overflow-hidden flex-shrink-0">
                            <img src={image} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-300 block truncate">Image {index + 1}</span>
                            <span className="text-xs text-gray-400 block truncate">{image.split('/').pop()}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-500 rounded flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs text-gray-300">{image.name}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newImages = formData.images?.filter((_, i) => i !== index) || [];
                        setFormData(prev => ({ ...prev, images: newImages }));
                      }}
                      className="border-red-500 text-red-400 hover:bg-red-500/10 h-6 px-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Canvas */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-sm">Canvas Images</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange('canvas', e.target.files)}
              className="bg-gray-600 border-gray-500"
            />
            {formData.canvas && formData.canvas.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.canvas.map((canvas, index) => {
                  console.log('Rendering canvas:', canvas, 'Type:', typeof canvas);
                  return (
                    <div key={index} className="flex items-center justify-between bg-gray-600 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        {typeof canvas === 'string' ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-24 h-16 bg-gray-500 rounded overflow-hidden flex-shrink-0 relative group">
                              {canvas.includes('.mp4') || canvas.includes('.mov') || canvas.includes('.m4v') ? (
                                <video 
                                  src={canvas} 
                                  className="w-full h-full object-cover"
                                  muted
                                  preload="metadata"
                                  playsInline
                                  controls
                                  autoPlay
                                  loop
                                  onLoadedData={(e) => {
                                    console.log('Canvas video loaded:', canvas);
                                    // Set to 1 second to show a frame
                                    e.currentTarget.currentTime = 1;
                                  }}
                                  onError={(e) => {
                                    console.error('Canvas video error:', canvas, e);
                                  }}
                                />
                              ) : (
                                <img 
                                  src={canvas} 
                                  alt={`Canvas ${index + 1}`} 
                                  className="w-full h-full object-cover"
                                  onLoad={() => console.log('Canvas image loaded:', canvas)}
                                  onError={(e) => console.error('Canvas image error:', canvas, e)}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-300 block truncate">Canvas {index + 1}</span>
                              <span className="text-xs text-gray-400 block truncate">{canvas.split('/').pop()}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-500 rounded flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs text-gray-300">{canvas.name}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newCanvas = formData.canvas?.filter((_, i) => i !== index) || [];
                          setFormData(prev => ({ ...prev, canvas: newCanvas }));
                        }}
                        className="border-red-500 text-red-400 hover:bg-red-500/10 h-6 px-2"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assets */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-sm">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              multiple
              onChange={(e) => handleFileChange('assets', e.target.files)}
              className="bg-gray-600 border-gray-500"
            />
            {formData.assets && formData.assets.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.assets.map((asset, index) => {
                  const isVideo = typeof asset === 'string' && (asset.includes('.mp4') || asset.includes('.mov') || asset.includes('.m4v') || asset.includes('.avi') || asset.includes('.webm'));
                  const isImage = typeof asset === 'string' && (asset.includes('.jpg') || asset.includes('.jpeg') || asset.includes('.png') || asset.includes('.gif') || asset.includes('.webp') || asset.includes('.svg'));
                  
                  return (
                    <div key={index} className="flex items-center justify-between bg-gray-600 p-2 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-12 bg-gray-500 rounded overflow-hidden flex-shrink-0">
                          {typeof asset === 'string' ? (
                            isVideo ? (
                              <video 
                                src={asset} 
                                className="w-full h-full object-cover"
                                muted
                                preload="metadata"
                                playsInline
                                controls
                                autoPlay
                                loop
                                onLoadedData={(e) => {
                                  e.currentTarget.currentTime = 1;
                                }}
                                onError={(e) => {
                                  console.error('Asset video error:', asset, e);
                                }}
                              />
                            ) : isImage ? (
                              <img 
                                src={asset} 
                                alt={`Asset ${index + 1}`} 
                                className="w-full h-full object-cover"
                                onLoad={() => console.log('Asset image loaded:', asset)}
                                onError={(e) => console.error('Asset image error:', asset, e)}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-400">
                                <span className="text-xs text-white font-bold">FILE</span>
                              </div>
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-400">
                              <span className="text-xs text-white font-bold">FILE</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-300 block truncate">Asset {index + 1}</span>
                          <span className="text-xs text-gray-400 block truncate">
                            {typeof asset === 'string' ? asset.split('/').pop() : asset.name}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newAssets = formData.assets?.filter((_, i) => i !== index) || [];
                          setFormData(prev => ({ ...prev, assets: newAssets }));
                        }}
                        className="border-red-500 text-red-400 hover:bg-red-500/10 h-6 px-2"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Artworks */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-sm">Artworks</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange('artworks', e.target.files)}
              className="bg-gray-600 border-gray-500"
            />
            {formData.artworks && formData.artworks.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.artworks.map((artwork, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-600 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      {typeof artwork === 'string' ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-12 bg-gray-500 rounded overflow-hidden flex-shrink-0">
                            <img src={artwork} alt={`Artwork ${index + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-300 block truncate">Artwork {index + 1}</span>
                            <span className="text-xs text-gray-400 block truncate">{artwork.split('/').pop()}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-500 rounded flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs text-gray-300">{artwork.name}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newArtworks = formData.artworks?.filter((_, i) => i !== index) || [];
                        setFormData(prev => ({ ...prev, artworks: newArtworks }));
                      }}
                      className="border-red-500 text-red-400 hover:bg-red-500/10 h-6 px-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
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
              Save Work
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default WorksManager;