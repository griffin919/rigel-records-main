# CompactTable Component

A responsive, reusable table component that automatically adapts between desktop table view and mobile card view.

## Features

✨ **Fully Responsive** - Seamlessly switches between desktop tables and mobile cards  
🎨 **Customizable** - Configure columns, widths, and cell formatting  
📱 **Mobile-Optimized** - Clean card layout with 2-column grid on mobile  
🔄 **Slot-Based** - Use scoped slots to customize any cell  
⚡ **Lightweight** - Minimal CSS, no dependencies  

## Usage

### Basic Setup

```vue
<template>
  <CompactTable 
    :columns="tableColumns" 
    :items="data"
    empty-message="No data available"
  />
</template>

<script setup>
const tableColumns = [
  { key: 'name', label: 'Name', width: '1.5' },
  { key: 'email', label: 'Email', width: '2' },
  { key: 'status', label: 'Status', width: '1' },
];

const data = [
  { id: 1, name: 'John', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane', email: 'jane@example.com', status: 'Inactive' },
];
</script>
```

### With Custom Cell Templates

```vue
<CompactTable :columns="columns" :items="items">
  <!-- Custom cell rendering -->
  <template #cell-status="{ item }">
    <span :class="{ active: item.status === 'Active' }">
      {{ item.status }}
    </span>
  </template>

  <!-- Row actions -->
  <template #row-actions="{ item }">
    <button @click="edit(item)">Edit</button>
    <button @click="delete(item)">Delete</button>
  </template>
</CompactTable>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `columns` | Array | Yes | - | Column configuration array |
| `items` | Array | Yes | - | Array of data to display |
| `hasHeader` | Boolean | No | true | Show column headers |
| `emptyMessage` | String | No | 'No data available' | Message when items array is empty |

## Column Configuration

Each column object should have:

```javascript
{
  key: 'fieldName',        // Data key to display
  label: 'Display Name',   // Header label
  width: '1.5',            // Flex width (optional, default: '1')
  format: (value) => {},   // Custom formatter (optional)
  decimals: 2              // For numbers (optional)
}
```

## Slots

### Named Slots

- `#cell-{key}` - Custom rendering for specific column cells
  - Props: `{ item, column, index }`
  
- `#row-actions` - Actions column content
  - Props: `{ item, index }`

## Breakpoints

- **Desktop** (≥768px): Shows traditional table layout with header row
- **Mobile** (<768px): Shows card layout with 2-column grid per row

## Styling Classes

The component uses these CSS classes for customization:

- `.compact-table-wrapper` - Main container
- `.compact-table-header` - Header row (desktop only)
- `.compact-table-body` - Body container
- `.table-cell` - Individual cell (desktop)
- `.mobile-card` - Card container (mobile)
- `.empty-state` - Empty state message

## Example: Transactions Table

This is implemented in `app/pages/index.vue`:

```vue
<CompactTable 
  :columns="tableColumns" 
  :items="filteredTransactions"
>
  <template #cell-company="{ item }">
    <div class="company-cell">
      <div class="company-badge" :style="{ backgroundColor: getItemColor(item.itemName) }">
        <!-- Icon -->
      </div>
      <span>{{ item.company }}</span>
    </div>
  </template>

  <template #cell-cost="{ item }">
    <span class="cost-badge">GHS {{ item.cost }}</span>
  </template>
</CompactTable>
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Tips

1. **Adjust column widths** using the `width` property (flex basis)
2. **Use scoped slots** for complex cell content
3. **Mobile cards** automatically stack all fields in a 2-column layout
4. **Empty state** shows when items array is empty
5. **No row selection** - add your own if needed using row-actions slot
