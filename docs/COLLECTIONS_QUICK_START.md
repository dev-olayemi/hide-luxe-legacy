# Collections Management - Quick Start

## 🚀 Get Started in 3 Steps

### Step 1: Go to Admin Panel
Visit: `https://28hideluxe.com/admin/collections`

### Step 2: Choose Your Action

| Action | Steps |
|--------|-------|
| **View Collections** | You'll see all 6 collections displayed with their images and details |
| **Add New Collection** | Click "+ Add Collection" button → Fill form → Click "Create" |
| **Edit Collection** | Click "Edit" on any card → Modify fields → Click "Update" |
| **Delete Collection** | Click "Delete" on any card → Confirm deletion |
| **Reorder Collections** | Use the "Display Order" field (0=first, 1=second, etc.) |
| **Toggle Featured** | Check/uncheck "Featured" to show in main grid vs secondary |

### Step 3: See Changes Live
Your changes appear immediately on the homepage at the "Explore Our Collections" section!

## ⚡ Quick Tips

✅ **Featured collections** (5) appear on homepage  
✅ **Top 3 featured** get large cards in main grid  
✅ **Others featured** get smaller cards in secondary grid  
✅ **Edit order** with the "Display Order" number field  
✅ **Add image** - provide full URL or relative path (`/collections/image.jpg`)  

## 📝 Collection Fields

| Field | Required | Purpose |
|-------|----------|---------|
| **Slug/ID** | Yes | Unique identifier for URL (e.g., `footwear`) |
| **Title** | Yes | Display name on card |
| **Description** | Yes | Text shown on collection card |
| **Image URL** | Optional | Cover image (shows placeholder if empty) |
| **Featured** | No | Show on homepage? (default: yes) |
| **Display Order** | No | Sort order (0=first) |

## 🔄 Made a Mistake?

**Want to reset to defaults?**

Run this command:
```bash
node scripts/setup-collections.mjs
```

**Collections still not showing?**

1. Check Firestore console - verify "collections" collection exists
2. Refresh admin page (Ctrl+F5)
3. Check browser console for errors (F12)

## 📸 Example Form Values

For a new collection entry:

```
Slug/ID: custom-bags
Title: Custom Leather Bags
Description: Our signature collection of handcrafted leather bags made with premium Italian leather
Image URL: https://example.com/custom-bags.jpg
Featured: ✓ (checked)
Display Order: 6
```

## 🎯 That's It!

You're all set. Go to `/admin/collections` and start managing your collections! 🎉
