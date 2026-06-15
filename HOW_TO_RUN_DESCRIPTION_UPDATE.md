# How to Run Product Description Update

## Quick Start

You need to be in the project root directory first!

### Step 1: Navigate to Project Directory

Open PowerShell and navigate to your project:

```powershell
cd "C:\Users\darto\Documents\Cursor App Dev\MOTARRO Supplies-theme-cursor"
```

### Step 2: Run the Update Script

**Option A: Use the PowerShell script (easiest)**
```powershell
.\scripts\run-description-update.ps1
```

**Option B: Run scripts manually**

First, generate descriptions:
```powershell
npx tsx scripts/generate-product-descriptions-seo.ts
```

Then update the database:
```powershell
npx tsx scripts/update-product-descriptions.ts
```

## What Each Script Does

### 1. `generate-product-descriptions-seo.ts`
- Fetches all products from your live API
- Generates unique 300-600 word SEO descriptions
- Creates 4-6 FAQs per product
- Saves to `product-descriptions-seo-complete.json`

### 2. `update-product-descriptions.ts`
- Reads the JSON file
- Updates all product descriptions in database
- Shows success/failure summary
- Saves FAQs to `product-faqs.json`

## Troubleshooting

**Error: "Cannot find module"**
- Make sure you're in the project root directory
- Check that `scripts/generate-product-descriptions-seo.ts` exists

**Error: "Command not recognized"**
- You're in the wrong directory (like C:\WINDOWS\system32)
- Navigate to project root first: `cd "C:\Users\darto\Documents\Cursor App Dev\MOTARRO Supplies-theme-cursor"`

**Error: "Missing Supabase environment variables"**
- The script needs to connect to your API
- Make sure your `.env` file has the correct variables
- Or the script will use the live API at https://www.motarro.co.za

## Expected Output

After running, you should see:
1. "Fetching all products from live API..."
2. "Found X products"
3. "✓ Saved to: product-descriptions-seo-complete.json"
4. Then database update progress
5. Summary showing successful/failed updates

