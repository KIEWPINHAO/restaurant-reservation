import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MenuDisplay } from '@/components/MenuDisplay';
import { getMenuItems, uploadMenuImage } from '@/lib/api';
import { toast } from 'sonner';
import type { MenuItem } from '@/types';
import { Upload } from 'lucide-react';

export function MenuUpload() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    const response = await getMenuItems();
    
    if (response.success && response.data) {
      setMenuItems(response.data);
    } else {
      toast.error(response.error || 'Failed to fetch menu');
    }
    
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setFile(null);
      return;
    }

    // Validate file type
    if (!f.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      e.target.value = '';
      return;
    }

    // Validate file size (5MB max)
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      e.target.value = '';
      return;
    }

    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select an image file');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter a name for the menu item');
      return;
    }

    const parsedPrice = parseFloat(price as any);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setUploading(true);
    try {
      const response = await uploadMenuImage(file, name.trim(), description.trim(), parsedPrice);

      if (response.success) {
        toast.success('Menu item uploaded successfully');
        // reset form
        setFile(null);
        setName('');
        setDescription('');
        setPrice('');
        fetchMenuItems();
      } else {
        toast.error(response.error || 'Failed to upload image');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading menu...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <p className="text-muted-foreground">Upload and manage menu items</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Menu Item</CardTitle>
          <CardDescription>
            Add a new dish to the menu by uploading an image
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="menu-upload">Select Image</Label>
              <div className="flex gap-2">
                <Input
                  id="menu-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="flex-1"
                />
                <Button disabled={uploading} type="submit">
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Create Item'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Supported formats: JPG, PNG, GIF (max 5MB)
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Current Menu Items</h2>
        <MenuDisplay items={menuItems} />
      </div>
    </div>
  );
}
