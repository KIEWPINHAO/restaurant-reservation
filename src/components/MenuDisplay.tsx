import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { MenuItem } from '@/types';

interface MenuDisplayProps {
  items: MenuItem[];
}

export function MenuDisplay({ items }: MenuDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <span className="text-lg font-bold text-primary">
                ${item.price.toFixed(2)}
              </span>
            </div>
            {item.description && (
              <CardDescription>{item.description}</CardDescription>
            )}
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
