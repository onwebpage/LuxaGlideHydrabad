# Filter & Vendor Page Management Implementation Guide

## Summary
This guide shows how to make home page filters and vendor page cards editable from admin panel.

## Changes Made

### 1. Schema Updates (shared/schema.ts)
Added new schemas for filter settings and vendor page cards management.

### 2. API Routes to Add (server/routes.ts)

Add these imports at the top:
```typescript
import { filterSettingsSchema, vendorPageCardsSchema } from "@shared/schema";
```

Add these routes after the existing CMS routes:

```typescript
// Admin: Update filter settings
app.patch("/api/admin/cms/filter-settings", requireAdminAuth, async (req, res) => {
  try {
    const parsed = filterSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const setting = await storage.upsertCmsSetting({
      key: CMS_KEYS.FILTER_SETTINGS,
      value: parsed.data,
    });
    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update vendor page cards
app.patch("/api/admin/cms/vendor-cards", requireAdminAuth, async (req, res) => {
  try {
    const parsed = vendorPageCardsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const setting = await storage.upsertCmsSetting({
      key: CMS_KEYS.VENDOR_PAGE_CARDS,
      value: parsed.data,
    });
    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
```

Update the public CMS endpoint to include new settings:
```typescript
case CMS_KEYS.FILTER_SETTINGS:
  settingsMap.filterSettings = setting.value as any;
  break;
case CMS_KEYS.VENDOR_PAGE_CARDS:
  settingsMap.vendorPageCards = setting.value as any;
  break;
```

And in the result object:
```typescript
filterSettings: { ...defaultCmsSettings.filterSettings, ...settingsMap.filterSettings },
vendorPageCards: settingsMap.vendorPageCards || defaultCmsSettings.vendorPageCards,
```

### 3. Admin Page for Filter Management

Create: `client/src/pages/AdminFilterSettings.tsx`

### 4. Admin Page for Vendor Cards Management

Create: `client/src/pages/AdminVendorCards.tsx`

### 5. Update Home.tsx to Use Filter Settings

Fetch filter settings from CMS and conditionally render filters based on settings.

### 6. Update Vendors.tsx to Use Dynamic Cards

Fetch vendor cards from CMS and render them dynamically.

## Next Steps

1. Run the application
2. Login as admin
3. Navigate to new admin pages to configure filters and vendor cards
4. Changes will reflect immediately on home and vendor pages
