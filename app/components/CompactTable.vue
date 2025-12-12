<template>
  <div >
    <!-- Desktop Table -->
    <div class="desktop-table-wrapper desktop-only">
      <table class="responsive-table">
        <thead v-if="hasHeader">
          <tr>
            <th v-for="column in columns" :key="column.key" :style="{ width: column.width ? `${column.width}%` : 'auto' }">
              {{ column.label }}
            </th>
            <th v-if="$slots['row-actions']" class="actions-header">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody v-if="items.length > 0">
          <tr v-for="(item, index) in items" :key="item.id || index">
            <td v-for="column in columns" :key="column.key">
              <slot :name="`cell-${column.key}`" :item="item" :column="column" :index="index">
                {{ formatCellValue(item[column.key], column) }}
              </slot>
            </td>
            <td v-if="$slots['row-actions']" class="actions-cell">
              <slot name="row-actions" :item="item" :index="index" />
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Empty State for Desktop -->
      <div v-if="items.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <p>{{ emptyMessage }}</p>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div class="mobile-cards-container mobile-only">
      <div v-if="items.length > 0" class="mobile-cards-grid">
        <div v-for="(item, index) in items" :key="item.id || index" class="mobile-card">
          <div v-for="column in columns" :key="column.key" class="mobile-field">
            <span class="mobile-label">{{ column.label }}</span>
            <span class="mobile-value">
              <slot :name="`cell-${column.key}`" :item="item" :column="column" :index="index">
                {{ formatCellValue(item[column.key], column) }}
              </slot>
            </span>
          </div>
          <div v-if="$slots['row-actions']" class="mobile-actions">
            <slot name="row-actions" :item="item" :index="index" />
          </div>
        </div>
      </div>
      
      <!-- Empty State for Mobile -->
      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <p>{{ emptyMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    // Expected format: [{ key: 'name', label: 'Name', width: '1' }, ...]
  },
  items: {
    type: Array,
    required: true,
  },
  hasHeader: {
    type: Boolean,
    default: true,
  },
  emptyMessage: {
    type: String,
    default: 'No data available',
  },
})

const formatCellValue = (value, column) => {
  if (value === null || value === undefined) return '-'
  
  if (column.format) {
    return column.format(value)
  }
  
  if (typeof value === 'number') {
    return value.toFixed(column.decimals ?? 0)
  }
  
  return String(value)
}
</script>

<style scoped>
/* Container */
.table-container {
  width: 100%;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Visibility Classes */
.desktop-only {
  display: none;
}

.mobile-only {
  display: block;
}

/* Desktop Table Styles */
.desktop-table-wrapper {
  position: relative;
  width: 100%;
}

.responsive-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  text-align: left;
}

.responsive-table thead {
  background: linear-gradient(to right, #f9fafb, #f3f4f6);
  border-bottom: 1px solid #e5e7eb;
}

.responsive-table thead th {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.responsive-table tbody tr {
  background: white;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.responsive-table tbody tr:hover {
  background-color: #fafbfc;
}

.responsive-table tbody tr:last-child {
  border-bottom: none;
}

.responsive-table tbody td {
  padding: 1rem 1.5rem;
  color: #111827;
  font-weight: 500;
  white-space: nowrap;
}

.responsive-table tbody td:first-child {
  font-weight: 600;
}

.actions-header {
  text-align: right;
  width: 100px;
}

.actions-cell {
  text-align: right;
  white-space: nowrap;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Mobile Cards */
.mobile-cards-container {
  width: 100%;
}

.mobile-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding: 0.75rem;
}

.mobile-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mobile-field {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.mobile-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.mobile-value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
  word-break: break-word;
  text-align: right;
}

.mobile-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #9ca3af;
}

.empty-state svg {
  margin: 0 auto 1rem;
  opacity: 0.3;
  color: #d1d5db;
}

.empty-state p {
  margin: 0;
  font-size: 0.9375rem;
  color: #6b7280;
}

/* Responsive Breakpoints */
@media (min-width: 768px) {
  .desktop-only {
    display: block;
  }

  .mobile-only {
    display: none;
  }
}

/* Small Mobile: Single Column */
@media (max-width: 639px) {
  .mobile-cards-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .mobile-card {
    padding: 0.75rem;
  }
}
</style>
