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
      label: 'Created At',
      key: 'createdAt',
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
    }    
  ]
}

export const tableComputed: Record<string, (row: Record<string, any>) => Record<string, any>> = {
  items: (row) => ({
    fileCount: row.files.length,
  }),
  tags: (row) => ({
    
  }),
}