<template>
  <div class="responsive-table-container">
    <!-- Desktop/Tablet View -->
    <div class="desktop-view">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th v-for="column in columns" :key="column.key">
                {{ column.label }}
              </th>
              <th v-if="$slots['row-actions']" class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody v-if="items.length > 0">
            <tr v-for="(item, index) in items" :key="item.id || index">
              <td v-for="column in columns" :key="column.key">
                <slot :name="`cell-${column.key}`" :item="item" :column="column" :index="index">
                  {{ formatValue(item[column.key]) }}
                </slot>
              </td>
              <td v-if="$slots['row-actions']" class="actions-col">
                <slot name="row-actions" :item="item" :index="index" />
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="items.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p>{{ emptyMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Mobile View -->
    <div class="mobile-view">
      <div v-if="items.length > 0" class="cards-grid">
        <div v-for="(item, index) in items" :key="item.id || index" class="card">
          <div v-for="column in columns" :key="column.key" class="card-row">
            <div class="card-label">{{ column.label }}</div>
            <div class="card-value">
              <slot :name="`cell-${column.key}`" :item="item" :column="column" :index="index">
                {{ formatValue(item[column.key]) }}
              </slot>
            </div>
          </div>
          <div v-if="$slots['row-actions']" class="card-actions">
            <slot name="row-actions" :item="item" :index="index" />
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p>{{ emptyMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  emptyMessage: {
    type: String,
    default: 'No data available',
  },
})

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  return value
}
</script>

<style scoped>
.responsive-table-container {
  width: 100%;
}

/* Mobile View - Default */
.mobile-view {
  display: block;
}

.desktop-view {
  display: none;
}

/* Desktop/Tablet View */
@media (min-width: 768px) {
  .mobile-view {
    display: none;
  }
  .desktop-view {
    display: block;
  }
}

.table-wrapper {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

th.actions-col {
  text-align: right;
  width: 150px;
}

tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}

tbody tr:hover {
  background: #f9fafb;
}

tbody tr:last-child {
  border-bottom: none;
}

td {
  padding: 1rem;
  font-size: 0.875rem;
  color: #111827;
}

td.actions-col {
  text-align: right;
}

/* Mobile Cards Styling */
.cards-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.625rem 0;
  gap: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.card-row:last-of-type {
  border-bottom: none;
}

.card-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.card-value {
  font-size: 0.875rem;
  color: #111827;
  text-align: right;
  word-break: break-word;
}

.card-actions {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Empty State */
.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
  color: #9ca3af;
}

.empty-state svg {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 500;
}
</style>
