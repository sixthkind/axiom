// This endpoint returns all items that a client has access to

routerAdd("GET", "/api/agent", async (e) => {
  const _client = e.request.url.query().get("client");
  const _userID = e.request.url.query().get("user");

  try {

    // Get correct client
    let client = $app.findFirstRecordByFilter(
      "clients",
      "name = {:name} && user = {:user}",
      { "name": _client, "user": _userID },
    )

    // Get client tags (permissions)
    $app.expandRecord(client, ["tags"], null)
    let tags = client.expandedAll("tags")

    // Get all items from tags
    let allItems = []
    for (let tag of tags) {
      $app.expandRecord(tag, ["items_via_tags"], null)
      let items = tag.expandedAll("items_via_tags")
      for (let item of items) {
        allItems.push({
          id: item.id,
          name: item.get("name"),
          content: item.get("content"),
          created: item.get("created"),
        })
      }
    }

    return e.json(200, allItems);
  } catch (err) {
    return e.json(500, { error: err.message });
  }
});