/// <reference path="../pb_data/types.d.ts" />

/**
 * API endpoints for Axiom user data
 * 
 * These endpoints authenticate using OAuth tokens and provide access to user items, clients, and tags
 */

// GET /api/v1/user/profile - Get user profile
routerAdd("GET", "/api/v1/user/profile", (e) => {
  const { validateApiKey } = require(`${__hooks}/utils/auth.js`);
  try {
    const validation = validateApiKey(e, $app);
    
    if (!validation.valid) {
      return e.json(401, {
        error: validation.error
      });
    }

    const user = validation.user;

    // Return user profile data (excluding sensitive fields)
    return e.json(200, {
      id: user.id,
      email: user.get("email"),
      name: user.get("name"),
      avatar: user.get("avatar"),
      created: user.get("created"),
      updated: user.get("updated")
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return e.json(500, {
      error: error.message || "Failed to fetch user profile"
    });
  }
});

// GET /api/v1/user/items - Get user items
routerAdd("GET", "/api/v1/user/items", (e) => {
  const { validateApiKey } = require(`${__hooks}/utils/auth.js`);
  try {
    const validation = validateApiKey(e, $app);
    
    if (!validation.valid) {
      return e.json(401, {
        error: validation.error
      });
    }

    const user = validation.user;
    
    // Parse query parameters
    const limit = parseInt(e.request.url.query().get("limit") || "50");
    const page = parseInt(e.request.url.query().get("page") || "1");
    
    // Validate pagination parameters
    const perPage = Math.min(Math.max(1, limit), 100);
    const currentPage = Math.max(1, page);
    
    // Build filter for user's items
    const filter = `user = "${user.id}"`;
    
    // Fetch items with pagination
    const items = $app.findRecordsByFilter(
      "items",
      filter,
      "-created",
      perPage,
      (currentPage - 1) * perPage
    );
    
    // Format item data
    const itemData = items.map((item) => ({
      id: item.id,
      title: item.get("title"),
      json: item.get("json"),
      files: item.get("files"),
      user: item.get("user"),
      created: item.get("created"),
      updated: item.get("updated")
    }));
    
    return e.json(200, {
      items: itemData,
      page: currentPage,
      perPage: perPage,
      count: itemData.length
    });
  } catch (error) {
    console.error("Error fetching user items:", error);
    return e.json(500, {
      error: error.message || "Failed to fetch user items"
    });
  }
});

// GET /api/v1/user/items/:id - Get single item
routerAdd("GET", "/api/v1/user/items/:id", (e) => {
  const { validateApiKey } = require(`${__hooks}/utils/auth.js`);
  try {
    const validation = validateApiKey(e, $app);
    
    if (!validation.valid) {
      return e.json(401, {
        error: validation.error
      });
    }

    const user = validation.user;
    const itemId = e.request.pathValue("id");
    
    // Fetch the item
    let item;
    try {
      item = $app.findRecordById("items", itemId);
    } catch (err) {
      return e.json(404, {
        error: "Item not found"
      });
    }
    
    // Verify the item belongs to this user
    if (item.get("user") !== user.id) {
      return e.json(403, {
        error: "Access denied: This item does not belong to you"
      });
    }
    
    return e.json(200, {
      id: item.id,
      title: item.get("title"),
      json: item.get("json"),
      files: item.get("files"),
      user: item.get("user"),
      created: item.get("created"),
      updated: item.get("updated")
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    return e.json(500, {
      error: error.message || "Failed to fetch item"
    });
  }
});

// POST /api/v1/user/items - Create item
routerAdd("POST", "/api/v1/user/items", (e) => {
  const { validateApiKey } = require(`${__hooks}/utils/auth.js`);
  try {
    const validation = validateApiKey(e, $app);
    
    if (!validation.valid) {
      return e.json(401, {
        error: validation.error
      });
    }

    const user = validation.user;
    
    // Parse request body
    const data = new DynamicModel({
      title: "",
      json: {},
      files: []
    });
    e.bindBody(data);
    
    // Create the item
    const collection = $app.findCollectionByNameOrId("items");
    const record = new Record(collection);
    record.set("title", data.title || "");
    record.set("json", data.json || {});
    record.set("files", data.files || []);
    record.set("user", user.id);
    $app.save(record);
    
    return e.json(201, {
      id: record.id,
      title: record.get("title"),
      json: record.get("json"),
      files: record.get("files"),
      user: record.get("user"),
      created: record.get("created"),
      updated: record.get("updated")
    });
  } catch (error) {
    console.error("Error creating item:", error);
    return e.json(500, {
      error: error.message || "Failed to create item"
    });
  }
});

// GET /api/v1/user/clients - Get user clients
routerAdd("GET", "/api/v1/user/clients", (e) => {
  const { validateApiKey } = require(`${__hooks}/utils/auth.js`);
  try {
    const validation = validateApiKey(e, $app);
    
    if (!validation.valid) {
      return e.json(401, {
        error: validation.error
      });
    }

    const user = validation.user;
    
    // Parse query parameters
    const limit = parseInt(e.request.url.query().get("limit") || "50");
    const page = parseInt(e.request.url.query().get("page") || "1");
    
    // Validate pagination parameters
    const perPage = Math.min(Math.max(1, limit), 100);
    const currentPage = Math.max(1, page);
    
    // Build filter for user's clients
    const filter = `user = "${user.id}"`;
    
    // Fetch clients with pagination
    const clients = $app.findRecordsByFilter(
      "clients",
      filter,
      "-created",
      perPage,
      (currentPage - 1) * perPage
    );
    
    // Format client data
    const clientData = clients.map((client) => ({
      id: client.id,
      name: client.get("name"),
      accessTags: client.get("accessTags"),
      user: client.get("user"),
      created: client.get("created"),
      updated: client.get("updated")
    }));
    
    return e.json(200, {
      clients: clientData,
      page: currentPage,
      perPage: perPage,
      count: clientData.length
    });
  } catch (error) {
    console.error("Error fetching user clients:", error);
    return e.json(500, {
      error: error.message || "Failed to fetch user clients"
    });
  }
});

// GET /api/v1/user/clients/:id - Get single client
routerAdd("GET", "/api/v1/user/clients/:id", (e) => {
  const { validateApiKey } = require(`${__hooks}/utils/auth.js`);
  try {
    const validation = validateApiKey(e, $app);
    
    if (!validation.valid) {
      return e.json(401, {
        error: validation.error
      });
    }

    const user = validation.user;
    const clientId = e.request.pathValue("id");
    
    // Fetch the client
    let client;
    try {
      client = $app.findRecordById("clients", clientId);
    } catch (err) {
      return e.json(404, {
        error: "Client not found"
      });
    }
    
    // Verify the client belongs to this user
    if (client.get("user") !== user.id) {
      return e.json(403, {
        error: "Access denied: This client does not belong to you"
      });
    }
    
    return e.json(200, {
      id: client.id,
      name: client.get("name"),
      accessTags: client.get("accessTags"),
      user: client.get("user"),
      created: client.get("created"),
      updated: client.get("updated")
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    return e.json(500, {
      error: error.message || "Failed to fetch client"
    });
  }
});

// POST /api/v1/user/clients - Create client
routerAdd("POST", "/api/v1/user/clients", (e) => {
  const { validateApiKey } = require(`${__hooks}/utils/auth.js`);
  try {
    const validation = validateApiKey(e, $app);
    
    if (!validation.valid) {
      return e.json(401, {
        error: validation.error
      });
    }

    const user = validation.user;
    
    // Parse request body
    const data = new DynamicModel({
      name: "",
      accessTags: []
    });
    e.bindBody(data);
    
    if (!data.name) {
      return e.json(400, {
        error: "Client name is required"
      });
    }
    
    // Create the client
    const collection = $app.findCollectionByNameOrId("clients");
    const record = new Record(collection);
    record.set("name", data.name);
    record.set("accessTags", data.accessTags || []);
    record.set("user", user.id);
    $app.save(record);
    
    return e.json(201, {
      id: record.id,
      name: record.get("name"),
      accessTags: record.get("accessTags"),
      user: record.get("user"),
      created: record.get("created"),
      updated: record.get("updated")
    });
  } catch (error) {
    console.error("Error creating client:", error);
    return e.json(500, {
      error: error.message || "Failed to create client"
    });
  }
});

// GET /api/v1/user/tags - Get user tags
routerAdd("GET", "/api/v1/user/tags", (e) => {
  const { validateApiKey } = require(`${__hooks}/utils/auth.js`);
  try {
    const validation = validateApiKey(e, $app);
    
    if (!validation.valid) {
      return e.json(401, {
        error: validation.error
      });
    }

    const user = validation.user;
    
    // Parse query parameters
    const limit = parseInt(e.request.url.query().get("limit") || "50");
    const page = parseInt(e.request.url.query().get("page") || "1");
    
    // Validate pagination parameters
    const perPage = Math.min(Math.max(1, limit), 100);
    const currentPage = Math.max(1, page);
    
    // Build filter for user's tags
    const filter = `user = "${user.id}"`;
    
    // Fetch tags with pagination
    const tags = $app.findRecordsByFilter(
      "tags",
      filter,
      "-created",
      perPage,
      (currentPage - 1) * perPage
    );
    
    // Format tag data
    const tagData = tags.map((tag) => ({
      id: tag.id,
      name: tag.get("name"),
      user: tag.get("user"),
      created: tag.get("created"),
      updated: tag.get("updated")
    }));
    
    return e.json(200, {
      tags: tagData,
      page: currentPage,
      perPage: perPage,
      count: tagData.length
    });
  } catch (error) {
    console.error("Error fetching user tags:", error);
    return e.json(500, {
      error: error.message || "Failed to fetch user tags"
    });
  }
});

// GET /api/v1/user/tags/:id - Get single tag
routerAdd("GET", "/api/v1/user/tags/:id", (e) => {
  const { validateApiKey } = require(`${__hooks}/utils/auth.js`);
  try {
    const validation = validateApiKey(e, $app);
    
    if (!validation.valid) {
      return e.json(401, {
        error: validation.error
      });
    }

    const user = validation.user;
    const tagId = e.request.pathValue("id");
    
    // Fetch the tag
    let tag;
    try {
      tag = $app.findRecordById("tags", tagId);
    } catch (err) {
      return e.json(404, {
        error: "Tag not found"
      });
    }
    
    // Verify the tag belongs to this user
    if (tag.get("user") !== user.id) {
      return e.json(403, {
        error: "Access denied: This tag does not belong to you"
      });
    }
    
    return e.json(200, {
      id: tag.id,
      name: tag.get("name"),
      user: tag.get("user"),
      created: tag.get("created"),
      updated: tag.get("updated")
    });
  } catch (error) {
    console.error("Error fetching tag:", error);
    return e.json(500, {
      error: error.message || "Failed to fetch tag"
    });
  }
});

// POST /api/v1/user/tags - Create tag
routerAdd("POST", "/api/v1/user/tags", (e) => {
  const { validateApiKey } = require(`${__hooks}/utils/auth.js`);
  try {
    const validation = validateApiKey(e, $app);
    
    if (!validation.valid) {
      return e.json(401, {
        error: validation.error
      });
    }

    const user = validation.user;
    
    // Parse request body
    const data = new DynamicModel({
      name: "",
      color: ""
    });
    e.bindBody(data);
    
    if (!data.name) {
      return e.json(400, {
        error: "Tag name is required"
      });
    }
    
    // Create the tag
    const collection = $app.findCollectionByNameOrId("tags");
    const record = new Record(collection);
    record.set("name", data.name);
    record.set("user", user.id);
    $app.save(record);
    
    return e.json(201, {
      id: record.id,
      name: record.get("name"),
      user: record.get("user"),
      created: record.get("created"),
      updated: record.get("updated")
    });
  } catch (error) {
    console.error("Error creating tag:", error);
    return e.json(500, {
      error: error.message || "Failed to create tag"
    });
  }
});

