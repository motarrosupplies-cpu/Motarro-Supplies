// Script to insert missing menu items (School Events and Blog)
// Run this via Node.js or copy the SQL to Supabase SQL Editor

const menuItemsToInsert = [
  {
    label: 'School Events',
    href: '/school-events',
    order_index: 6,
    level: 0,
    is_active: true,
    is_header: false,
    description: 'Browse school event products'
  },
  {
    label: 'Blog',
    href: '/blog',
    order_index: 7,
    level: 0,
    is_active: true,
    is_header: false,
    description: 'Read our latest articles and tips'
  }
]

const sqlStatements = menuItemsToInsert.map(item => `
INSERT INTO menu_items (label, href, order_index, level, is_active, is_header, description, created_at, updated_at)
SELECT 
  '${item.label}', 
  '${item.href}',
  ${item.order_index},
  ${item.level},
  ${item.is_active},
  ${item.is_header},
  '${item.description}',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items WHERE label = '${item.label}'
);
`).join('\n')

console.log('SQL to insert missing menu items:')
console.log(sqlStatements)
