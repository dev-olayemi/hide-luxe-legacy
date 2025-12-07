# Collections Migration Guide

This guide helps you set up the "Explore Our Collections" section in your Firestore database.

## What's New

You can now manage your collections directly from the admin panel (`/admin/collections`). The admin can:
- ✅ View all collections
- ✅ Add new collections
- ✅ Edit existing collections
- ✅ Delete collections
- ✅ Reorder collections
- ✅ Toggle featured status

## Step 1: Insert Collections into Firestore

Run the migration script to insert the default collections into your Firestore database:

**Using Node.js:**
```bash
node scripts/setup-collections.mjs
```

**Using Bun:**
```bash
bun scripts/setup-collections.mjs
```

**Using npm:**
```bash
npm run setup:collections
```

You should see output like:
```
📝 Setting up collections...
✓ No existing collections found. Adding 6 collections...
  ✓ Added: Luxury Footwear
  ✓ Added: Premium Apparel
  ✓ Added: Travel Luxury
  ✓ Added: Refined Accessories
  ✓ Added: Premium Furniture
  ✓ Added: Drive Luxury

✅ Successfully added 6 collections!
   You can now manage them in the admin panel at /admin/collections

🎉 Done!
```

## Step 2: Verify in Admin Panel

1. Go to your admin panel: `https://28hideluxe.com/admin/collections`
2. You should see all 6 collections displayed
3. You can now:
   - **Edit** collections to change title, description, image, or featured status
   - **Add** new collections
   - **Delete** collections
   - **Reorder** collections using the order field

## Step 3: Collections on Homepage

The "Explore Our Collections" section will now pull data from the Firestore `collections` collection instead of hard-coded defaults.

If the `collections` collection exists in Firestore, it will be used. Otherwise, it falls back to the default collections.

## Collection Schema

Each collection document has the following structure:

```javascript
{
  id: "footwear",                    // Document ID (slug)
  name: "footwear",                  // Slug/ID for URLs
  title: "Luxury Footwear",          // Display title
  description: "Step into luxury...", // Description
  image: "/collections/brown-men-shoe.jpg", // Image URL
  link: "/category/footwear",        // Category link
  featured: true,                    // Show in featured grid?
  order: 0,                          // Display order (0-based)
  createdAt: timestamp,              // Auto-generated
  updatedAt: timestamp               // Auto-generated
}
```

## API Reference

The following functions are available in `firebaseUtils.ts`:

### `getAllCollections()`
Fetches all collections from Firestore, sorted by order.

```typescript
const collections = await getAllCollections();
```

### `createCollection(data)`
Creates a new collection.

```typescript
const newCollection = await createCollection({
  name: "custom-collection",
  title: "My Custom Collection",
  description: "Description...",
  image: "...",
  featured: true,
  order: 5
});
```

### `updateCollection(id, updates)`
Updates an existing collection.

```typescript
await updateCollection("footwear", {
  title: "Updated Title",
  featured: false
});
```

### `deleteCollection(id)`
Deletes a collection.

```typescript
await deleteCollection("footwear");
```

## Troubleshooting

### "Failed to load collections" error

**Cause:** The `collections` Firestore collection doesn't exist yet.

**Solution:** Run the migration script: `node scripts/setup-collections.mjs`

### Collections not showing in admin panel

1. Check that you're signed in as an admin
2. Go to `/admin/collections`
3. Check browser console for errors
4. Verify the `collections` collection exists in Firestore

### Images not loading

Make sure image URLs are:
- Relative paths: `/collections/image.jpg`
- Full URLs: `https://example.com/image.jpg`
- Accessible and CORS-enabled

## Need Help?

If you have issues:
1. Check the browser console for error messages
2. Verify Firestore rules allow admin reads/writes
3. Ensure the `collections` collection was created: `node scripts/setup-collections.mjs`
4. Check that collection image URLs are accessible
