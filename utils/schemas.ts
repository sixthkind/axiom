function getSchema(type: string) {
  return schemas[type];
}

const schemas: any = {
  users: {
    name: { type: "text", label: "Name" },
    avatar: { type: "file", label: "Avatar", drop: true, "upload-temp-endpoint": false, "soft-remove": true }
  },
  items: {
    name: { type: "text", label: "Name" },
    json: { type: "textarea", label: "JSON" },
    files: { type: "file", label: "Files", drop: true, "upload-temp-endpoint": false, "soft-remove": true },
    tags: { type: "select", label: "Tags", options: [] }
  },
  notdeletable: ['users']
}

export { getSchema };