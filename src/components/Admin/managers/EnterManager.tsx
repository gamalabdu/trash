import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Progress } from '../../ui/progress';
import { Upload, Save, RefreshCw, Video, Play } from 'lucide-react';
import { sanityClient } from '../../../utils/sanityClient';

interface EnterData {
  _id?: string;
  name: string;
  enterVideo: File | string | null;
}

const EnterManager: React.FC = () => {
  const [enterData, setEnterData] = useState<EnterData>({
    name: '',
    enterVideo: null
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchEnterData();
  }, []);

  const fetchEnterData = async () => {
    setLoading(true);
    try {
      const data = await sanityClient.fetch(`
        *[_type == "enter"][0]{
          _id,
          name,
          enterVideo{
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

      if (data) {
        setEnterData({
          _id: data._id,
          name: data.name || '',
          enterVideo: data.enterVideo?.asset?.url || null
        });
      }
    } catch (error) {
      console.error('Error fetching enter data:', error);
      setMessage({ type: 'error', text: 'Failed to load enter page data' });
    }
    setLoading(false);
  };

  const uploadAsset = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const asset = await sanityClient.assets.upload('file', file, {
            filename: file.name
          });
          resolve(asset._id);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = (file: File | null) => {
    setEnterData(prev => ({
      ...prev,
      enterVideo: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const updateData: any = {
        name: enterData.name
      };

      // Upload video if it's a file
      if (enterData.enterVideo instanceof File) {
        setUploadProgress(25);
        const assetId = await uploadAsset(enterData.enterVideo);
        setUploadProgress(75);
        
        updateData.enterVideo = {
          _type: 'file',
          asset: {
            _type: 'reference',
            _ref: assetId
          }
        };
      }

      setUploadProgress(90);

      // Update or create the document
      if (enterData._id) {
        await sanityClient.patch(enterData._id).set(updateData).commit();
      } else {
        await sanityClient.create({
          _type: 'enter',
          ...updateData
        });
      }

      setUploadProgress(100);
      setMessage({ type: 'success', text: 'Enter page updated successfully!' });
      
      // Refresh data
      setTimeout(() => {
        fetchEnterData();
      }, 1000);

    } catch (error) {
      console.error('Error updating enter data:', error);
      setMessage({ type: 'error', text: 'Failed to update enter page' });
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading enter page data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Page Name</Label>
          <Input
            id="name"
            value={enterData.name}
            onChange={(e) => setEnterData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter page name"
            className="bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>

        {/* Video Upload */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Video className="w-5 h-5" />
              <span>Entry Video</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Upload the main video for the enter page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Video Preview */}
            {typeof enterData.enterVideo === 'string' && enterData.enterVideo && (
              <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden">
                <video 
                  src={enterData.enterVideo} 
                  controls
                  className="w-full h-full object-cover"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* File Input */}
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="bg-gray-600 border-gray-500 text-white"
              />
              <Video className="w-5 h-5 text-gray-400" />
            </div>

            {/* File Info */}
            {enterData.enterVideo instanceof File && (
              <div className="text-sm text-gray-400">
                <p>Selected: {enterData.enterVideo.name}</p>
                <p>Size: {(enterData.enterVideo.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Uploading video...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="bg-gray-700" />
          </div>
        )}

        {/* Messages */}
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <div className="flex space-x-4">
          <Button 
            type="submit" 
            disabled={uploading}
            className="bg-red-500 hover:bg-red-600"
          >
            {uploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={fetchEnterData}
            disabled={uploading}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnterManager;
