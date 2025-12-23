import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MenuDisplay } from '@/components/MenuDisplay';
import { getMenuItems } from '@/lib/api';
import { toast } from 'sonner';
import type { MenuItem } from '@/types';

export function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        <h1 className="text-3xl font-bold">Our Menu</h1>
        <p className="text-muted-foreground">Explore our delicious offerings</p>
      </div>

      <MenuDisplay items={menuItems} />
    </div>
  );
}
