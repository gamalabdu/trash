import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Progress } from '../../ui/progress';
import { Plus, Edit, Trash2, RefreshCw, Users, Upload, Save } from 'lucide-react';
import { sanityClient } from '../../../utils/sanityClient';

interface OutreachAsset {
  _id?: string;
  title: string;
  subtitle: string;
  assetImage?: File | string | null;
}

const OutreachManager: React.FC = () => {
  const [assets, setAssets] = useState<OutreachAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAsset, setEditingAsset] = useState<OutreachAsset | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const data = await sanityClient.fetch(`
        *[_type == "outreachAssets"]{
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
      });

      setAssets(data.map((asset: any) => ({
        _id: asset._id,
        title: asset.title || '',
        subtitle: asset.subtitle || '',
        assetImage: asset.assetImage?.asset?.url || null
      })));
    } catch (error) {
      console.error('Error fetching outreach assets:', error);
      setMessage({ type: 'error', text: 'Failed to load outreach assets' });
    }
    setLoading(false);
  };

  const handleAddAsset = () => {
    setEditingAsset({
      title: '',
      subtitle: '',
      assetImage: null
    });
    setIsDialogOpen(true);
  };

  const handleEditAsset = (asset: OutreachAsset) => {
    setEditingAsset({ ...asset });
    setIsDialogOpen(true);
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;

    try {
      await sanityClient.delete(assetId);
      setMessage({ type: 'success', text: 'Asset deleted successfully!' });
      fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      setMessage({ type: 'error', text: 'Failed to delete asset' });
    }
  };

  const uploadAsset = async (file: File): Promise<string> => {
    const asset = await sanityClient.assets.upload('image', file, {
      filename: file.name
    });
    return asset._id;
  };

  const handleSaveAsset = async (assetData: OutreachAsset) => {
    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const updateData: any = {
        title: assetData.title,
        subtitle: assetData.subtitle
      };

      if (assetData.assetImage instanceof File) {
        setUploadProgress(50);
        const assetId = await uploadAsset(assetData.assetImage);
        updateData.assetImage = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: assetId
          }
        };
      }

      setUploadProgress(90);

      if (assetData._id) {
        await sanityClient.patch(assetData._id).set(updateData).commit();
        setMessage({ type: 'success', text: 'Asset updated successfully!' });
      } else {
        await sanityClient.create({
          _type: 'outreachAssets',
          ...updateData
        });
        setMessage({ type: 'success', text: 'Asset added successfully!' });
      }

      setUploadProgress(100);
      setIsDialogOpen(false);
      setEditingAsset(null);
      
      setTimeout(() => {
        fetchAssets();
      }, 1000);

    } catch (error) {
      console.error('Error saving asset:', error);
      setMessage({ type: 'error', text: 'Failed to save asset' });
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading outreach assets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={handleAddAsset} className="bg-red-500 hover:bg-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <Card key={asset._id} className="bg-gray-700 border-gray-600">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{asset.title}</CardTitle>
                  <CardDescription className="text-gray-400">{asset.subtitle}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditAsset(asset)} className="border-gray-500 text-gray-300 hover:bg-gray-600">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => asset._id && handleDeleteAsset(asset._id)} className="border-red-500 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {typeof asset.assetImage === 'string' && asset.assetImage && (
                <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden">
                  <img src={asset.assetImage} alt={asset.title} className="w-full h-full object-cover" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {assets.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No assets found</h3>
          <p className="text-gray-500 mb-4">Start by adding your first outreach asset</p>
          <Button onClick={handleAddAsset} className="bg-red-500 hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Asset
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAsset?._id ? 'Edit Outreach Asset' : 'Add New Outreach Asset'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingAsset?._id ? 'Update asset information' : 'Add a new outreach asset'}
            </DialogDescription>
          </DialogHeader>
          
          {editingAsset && (
            <OutreachForm 
              asset={editingAsset}
              onSave={handleSaveAsset}
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

interface OutreachFormProps {
  asset: OutreachAsset;
  onSave: (asset: OutreachAsset) => void;
  onCancel: () => void;
  uploading: boolean;
  uploadProgress: number;
}

const OutreachForm: React.FC<OutreachFormProps> = ({ asset, onSave, onCancel, uploading, uploadProgress }) => {
  const [formData, setFormData] = useState<OutreachAsset>(asset);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
          <CardTitle className="text-white text-sm">Asset Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {typeof formData.assetImage === 'string' && formData.assetImage && (
            <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden">
              <img src={formData.assetImage} alt="Current asset" className="w-full h-full object-cover" />
            </div>
          )}
          <Input type="file" accept="image/*" onChange={(e) => setFormData(prev => ({ ...prev, assetImage: e.target.files?.[0] || null }))} className="bg-gray-600 border-gray-500" />
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
          {uploading ? <><Upload className="w-4 h-4 mr-2 animate-pulse" />Uploading...</> : <><Save className="w-4 h-4 mr-2" />Save Asset</>}
        </Button>
      </div>
    </form>
  );
};

export default OutreachManager;
