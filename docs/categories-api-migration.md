# Categories API Migration

## Overview

All category-related server actions have been migrated to REST API endpoints for better performance and client-side caching capabilities using TanStack Query.

## Changes Made

### 1. API Endpoints Created

#### Main Categories Endpoint
- **Route**: `GET /api/categories`
- **Location**: `app/api/categories/route.ts`
- **Query Parameters**:
  - `includeInactive` (boolean): Include inactive categories
  - `light` (boolean): Return light version (just names and IDs)
- **Features**:
  - Redis caching (10-minute TTL)
  - Optimized queries with selective fields
  - Proper error handling

#### Specific Category Endpoint
- **Route**: `GET /api/categories/[categoryId]`
- **Location**: `app/api/categories/[categoryId]/route.ts`
- **Features**:
  - Get category with all subcategories
  - Caching with Redis
  - 404 handling for non-existent categories

#### Subcategories by Slug Endpoint
- **Route**: `GET /api/categories/slug/[categorySlug]/subcategories`
- **Location**: `app/api/categories/slug/[categorySlug]/subcategories/route.ts`
- **Features**:
  - Get subcategories by category slug
  - Caching with Redis
  - Proper error handling

### 2. TanStack Query Hooks

#### `useCategories`
- **Location**: `hooks/use-categories.ts`
- **Purpose**: Get all categories with subcategories
- **Options**:
  - `includeInactive`: Include inactive categories
  - `enabled`: Control when query runs
  - `staleTime`: How long data stays fresh
  - `cacheTime`: How long data stays in cache

#### `useCategoriesLight`
- **Purpose**: Get light categories (just names and IDs)
- **Use case**: Dropdowns and simple lists

#### `useCategoryWithSubCategories`
- **Purpose**: Get specific category with subcategories
- **Parameters**: `categoryId` (string)

#### `useSubCategoriesBySlug`
- **Purpose**: Get subcategories by category slug
- **Parameters**: `categorySlug` (string)

### 3. Shared Types
- **Location**: `types/category.ts`
- **Types**:
  - `Category`: Full category with subcategories
  - `CategoryLight`: Light category (names only)
  - `CategoryWithSubCategories`: Category with subcategories
  - `SubCategory`: Individual subcategory
  - `CategoriesResponse<T>`: Generic API response

### 4. Updated Components
- **CategoriesSelector**: Now uses `useCategories` hook
- **Location**: `app/(browse)/_components/navbar/categories-selector.tsx`

## Usage Examples

### Basic Categories Usage
```tsx
import { useCategories } from "@/hooks/use-categories";

function MyComponent() {
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {categories?.map(category => (
        <div key={category.id}>{category.name}</div>
      ))}
    </div>
  );
}
```

### Light Categories for Dropdowns
```tsx
import { useCategoriesLight } from "@/hooks/use-categories";

function CategoryDropdown() {
  const { data: categories } = useCategoriesLight();

  return (
    <select>
      {categories?.map(category => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}
```

### Specific Category
```tsx
import { useCategoryWithSubCategories } from "@/hooks/use-categories";

function CategoryPage({ categoryId }: { categoryId: string }) {
  const { data: category } = useCategoryWithSubCategories(categoryId);

  return (
    <div>
      <h1>{category?.name}</h1>
      {category?.subCategories.map(sub => (
        <div key={sub.id}>{sub.name}</div>
      ))}
    </div>
  );
}
```

### Subcategories by Slug
```tsx
import { useSubCategoriesBySlug } from "@/hooks/use-categories";

function SubCategoriesList({ categorySlug }: { categorySlug: string }) {
  const { data: subCategories } = useSubCategoriesBySlug(categorySlug);

  return (
    <div>
      {subCategories?.map(sub => (
        <div key={sub.id}>{sub.name}</div>
      ))}
    </div>
  );
}
```

## Benefits

1. **Performance**: API endpoints are more efficient than server actions for read operations
2. **Caching**: TanStack Query provides intelligent client-side caching
3. **Type Safety**: Full TypeScript support with shared interfaces
4. **Error Handling**: Robust error handling with retry logic
5. **Developer Experience**: Better debugging and development tools
6. **Scalability**: Easier to add features like rate limiting and authentication

## Migration Notes

- All original server actions have been removed from `actions/categories.ts`
- The `CategoriesSelector` component has been updated to use the new hook
- Redis caching is maintained for optimal performance
- No breaking changes to existing functionality

## API Response Format

All endpoints return a consistent response format:

```typescript
{
  success: boolean;
  data?: T; // The actual data
  error?: string; // Error message if success is false
}
```

## Future Considerations

- Add authentication middleware to API endpoints if needed
- Implement rate limiting for API endpoints
- Add optimistic updates for category data
- Consider implementing real-time updates for category changes
- Add invalidation queries for when category data changes 