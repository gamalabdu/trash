import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Progress } from '../../ui/progress';
import { Upload, Save, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { sanityClient } from '../../../utils/sanityClient';

interface HomeData {
  _id?: string;
  name: string;
  homePic1: File | string | null;
  homePic2: File | string | null;
  titleIcon: File | string | null;
}

const HomeManager: React.FC = () => {
  const [homeData, setHomeData] = useState<HomeData>({
    name: '',
    homePic1: null,
    homePic2: null,
    titleIcon: null
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const data = await sanityClient.fetch(`
        *[_type == "home"][0]{
          _id,
          name,
          homePic1{
            asset -> {
              url
            }
          },
          homePic2{
            asset -> {
              url
            }
          },
          titleIcon{
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
        setHomeData({
          _id: data._id,
          name: data.name || '',
          homePic1: data.homePic1?.asset?.url || null,
          homePic2: data.homePic2?.asset?.url || null,
          titleIcon: data.titleIcon?.asset?.url || null
        });
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
      setMessage({ type: 'error', text: 'Failed to load home data' });
    }
    setLoading(false);
  };

  const uploadAsset = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const asset = await sanityClient.assets.upload('image', file, {
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

  const handleFileChange = (field: keyof HomeData, file: File | null) => {
    setHomeData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const updateData: any = {
        name: homeData.name
      };

      let progress = 0;
      const totalSteps = 3; // Number of potential file uploads

      // Upload homePic1 if it's a file
      if (homeData.homePic1 instanceof File) {
        const assetId = await uploadAsset(homeData.homePic1);
        updateData.homePic1 = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: assetId
          }
        };
        progress += 1;
        setUploadProgress((progress / totalSteps) * 100);
      }

      // Upload homePic2 if it's a file
      if (homeData.homePic2 instanceof File) {
        const assetId = await uploadAsset(homeData.homePic2);
        updateData.homePic2 = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: assetId
          }
        };
        progress += 1;
        setUploadProgress((progress / totalSteps) * 100);
      }

      // Upload titleIcon if it's a file
      if (homeData.titleIcon instanceof File) {
        const assetId = await uploadAsset(homeData.titleIcon);
        updateData.titleIcon = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: assetId
          }
        };
        progress += 1;
        setUploadProgress((progress / totalSteps) * 100);
      }

      // Update or create the document
      if (homeData._id) {
        await sanityClient.patch(homeData._id).set(updateData).commit();
      } else {
        await sanityClient.create({
          _type: 'home',
          ...updateData
        });
      }

      setUploadProgress(100);
      setMessage({ type: 'success', text: 'Home data updated successfully!' });
      
      // Refresh data
      setTimeout(() => {
        fetchHomeData();
      }, 1000);

    } catch (error) {
      console.error('Error updating home data:', error);
      setMessage({ type: 'error', text: 'Failed to update home data' });
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading home data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Site Title</Label>
          <Input
            id="name"
            value={homeData.name}
            onChange={(e) => setHomeData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter site title"
            className="bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>

        {/* Image Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Home Pic 1 */}
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-sm">Home Picture 1</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {typeof homeData.homePic1 === 'string' && homeData.homePic1 && (
                <div className="aspect-square bg-gray-600 rounded-lg overflow-hidden">
                  <img 
                    src={homeData.homePic1} 
                    alt="Home Pic 1" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('homePic1', e.target.files?.[0] || null)}
                  className="bg-gray-600 border-gray-500 text-white"
                />
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Home Pic 2 */}
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-sm">Home Picture 2</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {typeof homeData.homePic2 === 'string' && homeData.homePic2 && (
                <div className="aspect-square bg-gray-600 rounded-lg overflow-hidden">
                  <img 
                    src={homeData.homePic2} 
                    alt="Home Pic 2" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('homePic2', e.target.files?.[0] || null)}
                  className="bg-gray-600 border-gray-500 text-white"
                />
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Title Icon */}
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-sm">Title Icon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {typeof homeData.titleIcon === 'string' && homeData.titleIcon && (
                <div className="aspect-square bg-gray-600 rounded-lg overflow-hidden">
                  <img 
                    src={homeData.titleIcon} 
                    alt="Title Icon" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('titleIcon', e.target.files?.[0] || null)}
                  className="bg-gray-600 border-gray-500 text-white"
                />
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
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
            onClick={fetchHomeData}
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

export default HomeManager;
