export const tableColumns: any = {
  items: [
    {
      label: 'Name',
      key: 'name',
      sortable: true
    },
    {
      label: 'Tags',
      key: 'tagsFormatted',
      sortable: true
    },
    {
      label: 'Content',
      key: 'contentFormatted',
      sortable: false
    },
    {
      label: 'Files',
      key: 'fileCount',
      sortable: true
    },
    {
      label: 'Created',
      key: 'createdFormatted',
      sortable: true
    },
  ],
  tags: [
    {
      label: 'Name',
      key: 'nameFormatted',
      sortable: true
    },
    {
      label: 'Linked Items',
      key: 'numItems',
      sortable: true
    },
    {
      label: 'Created',
      key: 'createdFormatted',
      sortable: true
    }
  ]
}

export const tableComputed: Record<string, (row: Record<string, any>) => Record<string, any>> = {
  items: (row) => ({
    fileCount: row.files.length,
    tagsFormatted: row.expand?.tags?.map((tag: any) => `#${tag.name}`).join(' '),
    createdFormatted: row.created ? new Date(row.created).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }) : 'N/A',
    contentFormatted: row.content ? row.content.replace(/<[^>]*>/g, '') : ''
  }),
  tags: (row) => ({
    nameFormatted: `#${row.name}`,
    numItems: row.expand?.items_via_tags?.length,
    createdFormatted: row.created ? new Date(row.created).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }) : 'N/A'
  }),
}