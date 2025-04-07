async function getSchema(type: string) {
  let schema = schemas[type];

  if(type === 'items') {
    let tags = await getTags();
    schema.tags.items = tags;
  }

  return schema;
}

async function getTags() {
  const tags = await pb.collection('tags').getFullList();
  return tags.map(tag => ({
    value: tag.id,
    label: tag.name
  }));
}

const schemas: any = {
  users: {
    name: { type: "text", label: "Name" },
    avatar: { type: "file", label: "Avatar", drop: true, "upload-temp-endpoint": false, "soft-remove": true }
  },
  items: {
    name: { type: "text", label: "Name" },
    content: { type: "editor", label: "Content" },
    files: { type: "multifile", label: "Files", "upload-temp-endpoint": false, "soft-remove": true, "upload-button": false },
    tags: { type: "tags", label: "Tags", items: [] }
  },
  tags: {
    name: { type: "text", label: "Name" }
  },
  notdeletable: ['users']
}

export { getSchema };