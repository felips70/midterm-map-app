
exports.up = function(knex, Promise) {
  return knex.schema.createTable("favourites", function (table) {
    table.increments();
    table.integer("map_id").unsigned();
    table.foreign("map_id").references("maps.id");
    table.integer("user_id").unsigned();
    table.foreign("user_id").references("users.id");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("favourites");

};
