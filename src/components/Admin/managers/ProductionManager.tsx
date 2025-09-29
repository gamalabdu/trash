import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Plus, Edit, Trash2, RefreshCw, Music, Upload, Save, Play } from 'lucide-react';
import { sanityClient } from '../../../utils/sanityClient';

interface ProductionTrack {
  _id?: string;
  title: string;
  artist: string;
  final?: File | string | null;
  demo?: File | string | null;
}

const ProductionManager: React.FC = () => {
  const [tracks, setTracks] = useState<ProductionTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTrack, setEditingTrack] = useState<ProductionTrack | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const data = await sanityClient.fetch(`
        *[_type == "productionPage"]{
          _id,
          title,
          artist,
          final{
            asset->{
              url
            }
          },
          demo{
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

      setTracks(data.map((track: any) => ({
        _id: track._id,
        title: track.title || '',
        artist: track.artist || '',
        final: track.final?.asset?.url || null,
        demo: track.demo?.asset?.url || null
      })));
    } catch (error) {
      console.error('Error fetching production tracks:', error);
      setMessage({ type: 'error', text: 'Failed to load production tracks' });
    }
    setLoading(false);
  };

  const handleAddTrack = () => {
    setEditingTrack({
      title: '',
      artist: '',
      final: null,
      demo: null
    });
    setIsDialogOpen(true);
  };

  const handleEditTrack = (track: ProductionTrack) => {
    setEditingTrack({ ...track });
    setIsDialogOpen(true);
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!window.confirm('Are you sure you want to delete this track?')) return;

    try {
      await sanityClient.delete(trackId);
      setMessage({ type: 'success', text: 'Track deleted successfully!' });
      fetchTracks();
    } catch (error) {
      console.error('Error deleting track:', error);
      setMessage({ type: 'error', text: 'Failed to delete track' });
    }
  };

  const uploadAsset = async (file: File): Promise<string> => {
    const asset = await sanityClient.assets.upload('file', file, {
      filename: file.name
    });
    return asset._id;
  };

  const handleSaveTrack = async (trackData: ProductionTrack) => {
    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const updateData: any = {
        title: trackData.title,
        artist: trackData.artist
      };

      let progress = 0;
      const totalSteps = 2; // Final + demo

      // Upload final track if it's a file
      if (trackData.final instanceof File) {
        const assetId = await uploadAsset(trackData.final);
        updateData.final = {
          _type: 'file',
          asset: {
            _type: 'reference',
            _ref: assetId
          }
        };
        progress += 1;
        setUploadProgress((progress / totalSteps) * 100);
      }

      // Upload demo track if it's a file
      if (trackData.demo instanceof File) {
        const assetId = await uploadAsset(trackData.demo);
        updateData.demo = {
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
      if (trackData._id) {
        await sanityClient.patch(trackData._id).set(updateData).commit();
        setMessage({ type: 'success', text: 'Track updated successfully!' });
      } else {
        await sanityClient.create({
          _type: 'productionPage',
          ...updateData
        });
        setMessage({ type: 'success', text: 'Track added successfully!' });
      }

      setUploadProgress(100);
      setIsDialogOpen(false);
      setEditingTrack(null);
      
      // Refresh data
      setTimeout(() => {
        fetchTracks();
      }, 1000);

    } catch (error) {
      console.error('Error saving track:', error);
      setMessage({ type: 'error', text: 'Failed to save track' });
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading production tracks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Button onClick={handleAddTrack} className="bg-red-500 hover:bg-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Track
        </Button>
      </div>

      {/* Messages */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track) => (
          <Card key={track._id} className="bg-gray-700 border-gray-600">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{track.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {track.artist}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditTrack(track)}
                    className="border-gray-500 text-gray-300 hover:bg-gray-600"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => track._id && handleDeleteTrack(track._id)}
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1 mb-4">
                {typeof track.demo === 'string' && track.demo && (
                  <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-400">
                    <Play className="w-3 h-3 mr-1" />
                    Demo
                  </Badge>
                )}
                {typeof track.final === 'string' && track.final && (
                  <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                    <Play className="w-3 h-3 mr-1" />
                    Final
                  </Badge>
                )}
              </div>

              {/* Demo Audio */}
              {typeof track.demo === 'string' && track.demo && (
                <div>
                  <Label className="text-xs text-gray-400 mb-1 block">Demo Version</Label>
                  <audio 
                    controls 
                    className="w-full h-8"
                    style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                  >
                    <source src={track.demo} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {/* Final Audio */}
              {typeof track.final === 'string' && track.final && (
                <div>
                  <Label className="text-xs text-gray-400 mb-1 block">Final Version</Label>
                  <audio 
                    controls 
                    className="w-full h-8"
                    style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                  >
                    <source src={track.final} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {tracks.length === 0 && !loading && (
        <div className="text-center py-12">
          <Music className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No tracks found</h3>
          <p className="text-gray-500 mb-4">Start by adding your first production track</p>
          <Button onClick={handleAddTrack} className="bg-red-500 hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Track
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTrack?._id ? 'Edit Production Track' : 'Add New Production Track'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingTrack?._id ? 'Update track information and files' : 'Add a new production track with demo and final versions'}
            </DialogDescription>
          </DialogHeader>
          
          {editingTrack && (
            <ProductionForm 
              track={editingTrack}
              onSave={handleSaveTrack}
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
interface ProductionFormProps {
  track: ProductionTrack;
  onSave: (track: ProductionTrack) => void;
  onCancel: () => void;
  uploading: boolean;
  uploadProgress: number;
}

const ProductionForm: React.FC<ProductionFormProps> = ({ track, onSave, onCancel, uploading, uploadProgress }) => {
  const [formData, setFormData] = useState<ProductionTrack>(track);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleFileChange = (field: 'demo' | 'final', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Track Title *</Label>
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

      {/* Audio Files */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demo Version */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-sm">Demo Version</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {typeof formData.demo === 'string' && formData.demo && (
              <div className="bg-gray-600 rounded-lg p-4">
                <audio 
                  controls 
                  className="w-full"
                  style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                >
                  <source src={formData.demo} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            <Input
              type="file"
              accept="audio/*"
              onChange={(e) => handleFileChange('demo', e.target.files?.[0] || null)}
              className="bg-gray-600 border-gray-500"
            />
            {formData.demo instanceof File && (
              <div className="text-sm text-gray-400">
                <p>Selected: {formData.demo.name}</p>
                <p>Size: {(formData.demo.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Final Version */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-sm">Final Version</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {typeof formData.final === 'string' && formData.final && (
              <div className="bg-gray-600 rounded-lg p-4">
                <audio 
                  controls 
                  className="w-full"
                  style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                >
                  <source src={formData.final} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            <Input
              type="file"
              accept="audio/*"
              onChange={(e) => handleFileChange('final', e.target.files?.[0] || null)}
              className="bg-gray-600 border-gray-500"
            />
            {formData.final instanceof File && (
              <div className="text-sm text-gray-400">
                <p>Selected: {formData.final.name}</p>
                <p>Size: {(formData.final.size / 1024 / 1024).toFixed(2)} MB</p>
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
              Save Track
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProductionManager;
