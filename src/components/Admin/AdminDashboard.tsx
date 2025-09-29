import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LogOut, Upload, Users, Image, Music, Video, Home, FileText } from 'lucide-react';
import HomeManager from './managers/HomeManager';

import BrandingManager from './managers/BrandingManager';
import EnterManager from './managers/EnterManager';
import ForArtistManager from './managers/ForArtistManager';
import SongsManager from './managers/SongsManager';
import WorksManager from './managers/WorksManager';
import RosterManager from './managers/RosterManager';
import AlbumCoversManager from './managers/AlbumCoversManager';
import OutreachManager from './managers/OutreachManager';
import AssetCreationManager from './managers/AssetCreationManager';
import DigitalManager from './managers/DigitalManager';
import ProductionManager from './managers/ProductionManager';
import ArticleManager from './managers/ArticleManager';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeManager, setActiveManager] = useState('home');

  const contentTypes = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      description: 'Manage homepage content and images',
      component: HomeManager
    },
    {
      id: 'roster',
      label: 'Roster',
      icon: Users,
      description: 'Manage artist roster and profiles',
      component: RosterManager
    },
    {
      id: 'works',
      label: 'Works',
      icon: Image,
      description: 'Manage portfolio works and projects',
      component: WorksManager
    },
    {
      id: 'songs',
      label: 'Songs',
      icon: Music,
      description: 'Manage music tracks and audio content',
      component: SongsManager
    },
    {
      id: 'enter',
      label: 'Enter Page',
      icon: Video,
      description: 'Manage entry page video content',
      component: EnterManager
    },
    {
      id: 'forartist',
      label: 'For Artist',
      icon: FileText,
      description: 'Manage For Artist page content',
      component: ForArtistManager
    },
    {
      id: 'production',
      label: 'Production Page Music',
      icon: Music,
      description: 'Manage music production tracks',
      component: ProductionManager
    },
    {
      id: 'albumcovers',
      label: 'Production Page Album Covers',
      icon: Image,
      description: 'Manage album cover artwork',
      component: AlbumCoversManager
    },
    {
      id: 'outreach',
      label: 'Outreach',
      icon: Users,
      description: 'Manage outreach media assets',
      component: OutreachManager
    },
    {
      id: 'assetcreation',
      label: 'Asset Creation',
      icon: Image,
      description: 'Manage asset creation content',
      component: AssetCreationManager
    },
    {
      id: 'digital',
      label: 'Digital',
      icon: Video,
      description: 'Manage digital page content',
      component: DigitalManager
    },
    {
      id: 'branding',
      label: 'Branding',
      icon: Video,
      description: 'Manage branding page videos',
      component: BrandingManager
    },
    {
      id: 'articles',
      label: 'Articles',
      icon: FileText,
      description: 'Manage blog articles and content',
      component: ArticleManager
    }
  ];

  const currentManager = contentTypes.find(type => type.id === activeManager);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TRASH Admin Panel</h1>
              <p className="text-sm text-gray-400">Content Management System</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Manager Selection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={activeManager} onValueChange={setActiveManager}>
                <SelectTrigger className="w-80 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select a content manager" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600" sideOffset={8}>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id} className="text-white hover:bg-gray-700">
                      {type.label} - {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Manager Display */}
          {currentManager && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <currentManager.icon className="w-6 h-6 text-red-500" />
                  <div>
                    <CardTitle className="text-white">{currentManager.label} Management</CardTitle>
                    <CardDescription className="text-gray-400">
                      {currentManager.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <currentManager.component />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
