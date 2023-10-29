const Serializer = require("json-api-ify");

const serializer = new Serializer({
  topLevelMeta: {
    "api-version": "v1.0.0"
  }
});

serializer.define("users", {
  blacklist: [
    "password"
  ],
  id: "id",
  links: {
    self(resource, _, cb) {
      const link = "/users/" + resource.id;
      cb(null, link);
    }
  },
  processResource(resource, cb) {
    return cb(null, resource.data);
  },
  topLevelLinks: {
    self(options, cb) {
      const link = "/users";
      cb(null, link);
    }
  }
}, function(err) {
  if(err) {
    console.log(err);
  }
});

module.exports = serializer;

