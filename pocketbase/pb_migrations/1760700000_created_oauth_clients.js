/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Create oauth_clients collection for RFC 7591 Dynamic Client Registration
  const clientsCollection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210258",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_client_id",
        "max": 0,
        "min": 0,
        "name": "client_id",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_client_name",
        "max": 0,
        "min": 0,
        "name": "client_name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "json_redirect_uris",
        "maxSize": 0,
        "name": "redirect_uris",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json_grant_types",
        "maxSize": 0,
        "name": "grant_types",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json_response_types",
        "maxSize": 0,
        "name": "response_types",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_scope",
        "max": 0,
        "min": 0,
        "name": "scope",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_token_endpoint_auth_method",
        "max": 0,
        "min": 0,
        "name": "token_endpoint_auth_method",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "autodate_created",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate_updated",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "_oauth_clients",
    "indexes": [
      "CREATE UNIQUE INDEX idx_client_id ON _oauth_clients (client_id)"
    ],
    "listRule": null,
    "name": "_oauth_clients",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(clientsCollection);
}, (app) => {
  const clientsCollection = app.findCollectionByNameOrId("_oauth_clients");
  return app.delete(clientsCollection);
})

