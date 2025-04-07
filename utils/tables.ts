export const tableColumns: any = {
  items: [
    {
      label: 'ID',
      key: 'id',
      sortable: false
    },
    {
      label: 'Name',
      key: 'name',
      sortable: false
    },
    {
      label: 'JSON',
      key: 'json',
      sortable: false
    },
    {
      label: 'Files',
      key: 'fileCount',
      sortable: false
    },
    {
      label: 'Created',
      key: 'createdFormatted',
      sortable: false
    },
  ],
  tags: [
    {
      label: 'ID',
      key: 'id',
      sortable: false
    },
    {
      label: 'Name',
      key: 'name',
      sortable: false
    },
    {
      label: 'Created',
      key: 'createdFormatted',
      sortable: false
    }
  ]
}

export const tableComputed: Record<string, (row: Record<string, any>) => Record<string, any>> = {
  items: (row) => ({
    fileCount: row.files.length,
    createdFormatted: row.created ? new Date(row.created).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }) : 'N/A'
  }),
  tags: (row) => ({
    createdFormatted: row.created ? new Date(row.created).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }) : 'N/A'
  }),
}