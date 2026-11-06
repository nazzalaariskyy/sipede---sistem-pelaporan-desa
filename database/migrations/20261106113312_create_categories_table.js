
exports.up = function (knex) {
    return knex.schema.createTable('categories', function (table) {
        table.bigIncrements('id').primary();

        table.string('name', 100).notNullable().unique();
        table.text('description');

        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('categories');
};
